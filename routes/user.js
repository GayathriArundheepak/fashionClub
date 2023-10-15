const express = require("express");
const session =require('express-session')
const path=require('path');
const nocache = require('nocache');

const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const otpController = require("../controllers/otpController");
const userAddressController = require("../controllers/userAddressController");
const orderController = require("../controllers/orderController");
const categoryController = require("../controllers/categoryController");
const couponController = require('../controllers/couponController');

const auth=require('../middleware/user')
const adminauth=require('../middleware/admin')


const router=express();
router.set("view engine", "ejs");
router.set('views','./views/user');


router.use(express.urlencoded({ extended: true }));
router.use(express.static("public"));
router.use(express.json());
router.use(express.static(path.join(__dirname,'public')));
router.use( '/css',express.static(path.join(__dirname, '../public')))



router.use (session({
    secret:config.SESSION_SECRET,
    cookie:{sameSite:'strict'},
    saveUninitialized:true,
    resave:false}))

router.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
  res.header('Expires', '0');
  res.header('Pragma', 'no-cache');
  next();
});



router.get("/",userController.loadHome)
router.get("/register",userController.loadRegister);
router.post("/register", userController.insertUser);
router.get("/login", auth.isLogOut, userController.loginLoad);
router.post("/login", userController.verifyLogin);
router.get('/logout', auth.isLogin, userController.userLogout)
router.get("/reset-password",auth.checkUserStatus,userController.resetPasswordPage)
router.post("/newPassword",auth.checkUserStatus,userController.resetPassword)
router.get("/userUpdate",auth.checkUserStatus,userController.userUpdate)
router.post("/selfUpdateUser",auth.checkUserStatus,userController.selfUpdateUser )


// product  routes
router.get('/productDtailes/:productId',productController.productDetails )
router.get('/searchProducts',auth.checkUserStatus,productController.userSearchProducts )


// Route to generate and send OTP
router.post('/generate-otp',adminauth.otp,  otpController.generateAndSendOTP );
router.get('/generate-otp',adminauth.otp,  otpController.generateAndSendOTP );
// Route to handle OTP verification
router.post('/verify-otp',auth.otp, otpController.verifyOTP);



// Retrieve user addresses
router.get('/profile/addresses',auth.checkUserStatus, userAddressController.getUserAddresses);
router.get('/profile',auth.checkUserStatus, userAddressController.userProfile);
// Add a new address
router.get('/profile/addresses/add',auth.checkUserStatus, userAddressController.addAddressForm);
router.post('/profile/addresses/add',auth.checkUserStatus, userAddressController.addAddress);
// Edit an address
router.post('/profile/addresses/edit/:addressId',auth.checkUserStatus, userAddressController.editAddress);
// Delete an address
router.get('/profile/addresses/delete/:addressId',auth.checkUserStatus, userAddressController.deleteAddress);
router.get('/profile/addresses/selectedAddress/:addressId',auth.checkUserStatus, userAddressController. selectAddressForOrder);




// Retrieve orders for a specific user
router.get('/orders',auth.checkUserStatus,orderController.getUserOrders);
router.post('/orderCancel',auth.checkUserStatus,orderController.orderCancel)
// router.post('/cancel-order',auth.checkUserStatus,orderController.confirmFullOrderCancellation )
router.post('/cancel-Item',auth.checkUserStatus,orderController.cancelItem)



// Create a new coupon
router.post('/create', couponController.createCoupon);
// Apply a coupon to an order
router.post('/apply', couponController.applyCoupon);
router.get('/products/by-category/:categoryId',auth.checkUserStatus,categoryController.loadHomeWichCategoryFilter);


module.exports = router