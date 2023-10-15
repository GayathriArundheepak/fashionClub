const express = require("express");
const session =require('express-session')
const path=require('path');
const multer=require("multer")
// const nocache = require('nocache');
const Order = require('../models/order');
const Product = require('../models/product');

const adminauth=require('../middleware/admin')

const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");
const orderController = require("../controllers/orderController");
const bannerController = require("../controllers/bannerController");

const router=express();

router.set("view engine", "ejs");
router.set('views','./views/admin');



router.use(express.urlencoded({ extended: true }));
router.use(express.static("public"));
router.use(express.json());
router.use(express.static(path.join(__dirname,'public')));
router.use( '/css',express.static(path.join(__dirname, '../public')))



// Initialize Multer with the storage configuration


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/')); // Specify the destination folder for uploaded images
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null,Date.now()+'-'+file.originalname); // Generate a unique filename
  },
});

const upload = multer({ storage: storage, limits: { files: 3 ,fileSize:1024*1024} });
const uploadDouble = multer({ storage: storage, limits: { files: 2 ,fileSize:1500*1500} });
const uploadSingle = multer({ storage: storage, limits: { files: 1 ,fileSize:1024*1024} });




router.use (session({
    secret:config.SESSION_SECRET,
    cookie:{sameSite:'strict'},
    saveUninitialized:true,
    resave:false}
    ))
 

router.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
  res.header('Expires', '0');
  res.header('Pragma', 'no-cache');
  next();
});

// admin routes

router.get("/",adminauth.isLogOut, adminController.loadLogin )
router.get("/adminlogin",adminauth.isLogOut,adminController.loadLogin )
router.get("/home",adminauth.isLogin,adminController.adminDashboard)

router.post("/home",adminController.verify)
router.get("/home/user-list",adminController.userTable)
router.get("/home/logout",adminauth.isLogin,adminController.adminLogout)
router.get('/search',adminController.searchUser)
router.get('/searchProducts',adminController.searchProducts)
router.get('/update/user/:userId',adminController.updateUser)
router.post('/update/:userId/block', adminController.blockUser);
router.post('/update/unblock/:userId', adminController.unblockUser);





// products routes

router.get('/add-product',productController.addProduct)

router.get('/edit-product/:productId',productController.productEdit)

router.post('/edit-product/:id/edit-images/:index', uploadSingle.single('image'),productController.productImageEdit)

router.get('/delete-product/:productId',productController.productDelete)

router.post("/update-product/:productId",productController.updateProduct )
router.post('/upload',upload.array('images', 3),productController.uploadProduct)

router.get("/dashboard",productController.productTable)
router.get("/dashboard",productController.productTable)

router.get('/download-stock-report',productController.generateStockReport )




// // category routes

// Add a new category
router.post('/categories', categoryController.addCategory);

// Create routes for editing and deleting categories
router.post('/categories/:categoryId/edit',categoryController.editCategory)

// Delete a category
router.post('/categories/:categoryId', categoryController.deleteCategory);




// orders

router.get('/orders',orderController.getAllOrders)
router.post('/orders/edit/:orderId',orderController.editOrderStatus)

router.post('/download-sales-report',orderController.downloadSalesReport)
router.post('/download-cancel-report',orderController. downloadCancelReport) 
router.get('/download-sales-report/:year/:month', orderController.downloadSalesReport);

router.get('/bannerUploadPage',bannerController.bannerUploadPage)
router.post('/upload-banner', uploadDouble.array('bannerImages', 2),bannerController.uploadBanner)

module.exports = router;
















// Render the sales report view
router.get('/sales-report', (req, res) => {
  res.render('sales-report'); // Assuming you have set up EJS as your view engine
});


// API route to get order data for the Bar Chart with optional year and interval
router.get('/orders-bar', async (req, res) => {
  try {
    let pipeline = [
      {
        $match: {
          deliveredDate: { $ne: null }, // Filter only delivered orders
        },
      },
    ];

    // Check if a specific year is requested
    if (req.query.year) {
      pipeline.push({
        $match: {
          deliveredDate: {
            $gte: new Date(`${req.query.year}-01-01`),
            $lt: new Date(`${parseInt(req.query.year) + 1}-01-01`),
          },
        },
      });
    }

    // Check the requested interval (daily, monthly, yearly)
    if (req.query.interval === 'daily') {
      pipeline.push({
        $group: {
          _id: {    day: { $dayOfMonth: '$deliveredDate' },
         },
          totalOrders: { $sum: 1 },
        },
      });
      pipeline.push({ $sort: { '_id.day': 1 } });
    } else if (req.query.interval === 'monthly') {
      pipeline.push({
        $group: {
          _id: { month: { $month: '$deliveredDate' } },
          totalOrders: { $sum: 1 },
        },
      });
      pipeline.push({ $sort: { '_id.month': 1 } });
    } else if (req.query.interval === 'yearly') {
      pipeline.push({
        $group: {
          _id: { year: { $year: '$deliveredDate' } },
          totalOrders: { $sum: 1 },
        },
      });
      pipeline.push({ $sort: { '_id.year': 1 } });
    }

    const orderData = await Order.aggregate(pipeline);

    let labels, data;

    // Extract labels and data based on the requested interval
    if (req.query.interval === 'daily') {
      labels = orderData.map(item => item._id.day);
      data = orderData.map(item => item.totalOrders);
    } else if (req.query.interval === 'monthly') {
      labels = orderData.map(item => getMonthName(item._id.month));
      data = orderData.map(item => item.totalOrders);
    } else if (req.query.interval === 'yearly') {
      labels = orderData.map(item => item._id.year);
      data = orderData.map(item => item.totalOrders);
    }

    res.json({ labels, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Helper function to get month name
function getMonthName(month) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[month - 1];
}



