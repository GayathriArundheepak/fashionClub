const Product = require('../models/product');
const Category = require('../models/category');
const User = require('../models/user');
const Wishlist = require('../models/wishlist');
const Cart = require('../models/cart');
const sharp = require('sharp');
const ExcelJS = require('exceljs');
// Assuming you have a model named Product that represents products in your database


const fs = require('fs'); // Import the File System module

const uploadProduct = async (req, res) => {
    try {
        const { title, desc, price, stocks, category } = req.body;

        // Check if a product with the same title already exists
        const existingProduct = await Product.findOne({ title });

        if (existingProduct) {
            const message = "Product with the same title already exists.";
            return res.render('adminSweetAlert.ejs', { message });
        }
    
          if (!req.body.category || req.body.category.trim() === '') {
            const error ='Category is required' ;
            return res.status(404).render('error', { error, status: 404 });
          }
          
  // Check if stocks is less than zero
  if (req.body.stocks < 0) {
    const error = 'Stocks cannot be less than zero';
    return res.status(400).render('error', { error, status: 400 });
  }

  // Check if price is less than zero
  if (req.body.price < 0) {
    const error = 'Price cannot be less than zero';
    return res.status(400).render('error', { error, status: 400 });
  }

  // Check if description is empty
  if (!req.body.description || req.body.description.trim() === '') {
    const error = 'Description is required';
    return res.status(400).render('error', { error, status: 400 });
  }

        const adminId = req.session.admin_id;

        if (!adminId) {
            const message = "Admin not authenticated.";
            return res.render('adminSweetAlert.ejs', { message });
        }

        // Check if new images are provided in the request
        if (req.files && req.files.length > 0) {
            const uploadedImages = req.files;
            const processedImageURLs = [];
            const smallerAdminProductImageURL = []; // Define the array here
            // Process each uploaded image
            for (const image of uploadedImages) {
                // Use sharp to crop and resize the image
                const width = parseInt(req.query.width) || 250; // Default width
                const height = parseInt(req.query.height) || 250; // Default height
                await sharp(image.path)
                .resize(width, height, { fit: 'cover' }) // Crop to the specified dimensions
                    .toFile(`public/uploads/cropped_${image.filename}`); // Save the processed image

                // Add the processed image's URL to the response
                processedImageURLs.push(`/uploads/cropped_${image.filename}`);
                const adminWidth = parseInt(req.query.width) || 100; // Default width
                const adminHeight = parseInt(req.query.height) || 100; // Default height
        
                // Use Sharp to further reduce the size of the admin product image
                await sharp(image.path)
                .resize(adminWidth, adminHeight, { fit: 'cover' }) // Crop to the specified dimensions
                    .toFile(`public/uploads/admin_cropped_${image.filename}`); // Save the smaller admin product image
                    smallerAdminProductImageURL.push(`/uploads/admin_cropped_${image.filename}`)   
            }

            // Create a new Product document with image data
            const newProduct = new Product({
                title,
                desc,
                category,
                price,
                stocks,
                images: processedImageURLs, // Store the image data in the 'images' field
                adminProductImage: smallerAdminProductImageURL, // Store the smaller admin product image
            });

            // Save the new product to MongoDB
            await newProduct.save();

            // Update the category's product count and add the product to the category's products array
            await Category.findOneAndUpdate(
                { _id: category },
                {
                    $inc: { productCount: 1 },
                    $push: { products: newProduct },
                },
                { new: true }
            );

            res.redirect("/admin/add-product");
        } else {
            // Handle the case where no new images were provided
            const message = "Please provide at least one image for the product.";
            return res.render('adminSweetAlert.ejs', { message });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).render('error', { error, status: 500 });
    }
};


 const addProduct =async (req, res) => {
    const  adminId =req.session.admin_id
    if (!adminId) {
        const message = "admin not authenticated.";
       return  res.render('adminSweetAlert.ejs', { message });
      }
    const categories = await Category.find();
    // const subcategories = categories.flatMap((category) => category.subcategories);

res.render('add-product',{categories}); 
 }



  
const productDetails =async (req, res) => {
    try {
      
        const productId = req.params.productId;
        
    
        

    
    
        // const userData = await User.findById(userId); // Pass userId directly
        // console.log(userData);
        const cartData = await Cart.findOne({ userId: req.session.user_id }).populate({
            path: 'items.productId',
            model: 'Product', // Reference to your product model
          });
      
        const product = await Product.findById(productId);
        const categories  =await Category.find()
        const wishlist  =await Wishlist.findOne()
        if (!product) {
         
            const message ='product not found'
            return  res.render('userSweetAlert.ejs', { message });
        }

        // Render the product details page and pass the product data to the template
        res.render('product-details', { product, username: null,categories,wishlist,cartData  });
    } catch (error) {
        console.error(error.message);
        return  res.status(500).render('error', { error, status: 500 });
    }
};





// Function to render the admin list page
const productTable = async (req, res) => {
    try {
        const  adminId =req.session.admin_id
        const page = parseInt(req.query.page) || 1; // Get the requested page number
        const perPage = 5; // Number of items to display per page

        const products = await Product.find()
        .skip((page - 1) * perPage)
        .limit(perPage);
                
      const totalItems = await Product.countDocuments();
      const totalPages = Math.ceil(totalItems / perPage);
        if (!adminId) {
            const message = "admin not authenticated.";
           return  res.render('adminSweetAlert.ejs', { message });
          }

               
        
        res.render('product-list', { products: products ,page,
            totalPages, });
     
    } catch (error) {
        console.error(error.message);
        return  res.status(500).render('error', { error, status: 500 });
    }
};



const productEdit = async (req, res) => {
    try {
        const productId = req.params.productId;
        const  adminId =req.session.admin_id
        if (!adminId) {
            const message = "admin not authenticated.";
           return  res.render('adminSweetAlert.ejs', { message });
          }
        // Find the product by ID
        const product = await Product.findById(productId);

        if (!product) {
            // Product not found, handle this case (e.g., show an error message)
            const message ='Product not found'
            return  res.render('adminSweetAlert.ejs', { message });
        }

        // Render the edit-product page with the product data
        res.render('edit-product', { product }); // Replace 'edit-product' with your actual EJS template
    } catch (err) {
        console.error(err);
      return  res.status(500).render('error', { error, status: 500 });
    }
};


// Delete product
const productDelete = async (req, res) => {
    try {
     const  product=  req.params.productId  ;
     const  adminId =req.session.admin_id
     if (!adminId) {
         const message = "admin not authenticated.";
        return  res.render('adminSweetAlert.ejs', { message });
       }
        if (!product) {
            // Product not found, handle this case (e.g., show an error message)
          const message= 'Product not found'
            return  res.render('adminSweetAlert.ejs', { message });
        }

        // Delete the product
        await Product.deleteOne({ _id: req.params.id });
        const message =' product removed'
        return  res.render('adminSweetAlert.ejs', { message });
       

        // Redirect to the admin dashboard or return a success message
        // Example: res.redirect('/admin');
        // res.redirect('/admin'); // Redirect to your admin dashboard
    } catch (error) {
        console.log(error)
        return  res.status(500).render('error', { error, status: 500 });
    }
};

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const { title, desc, price,stocks,
            userCanVisible
             } = req.body;
        
        const  adminId =req.session.admin_id
        if (!adminId) {
            const message = "admin not authenticated.";
           return  res.render('adminSweetAlert.ejs', { message });
          }
        // Find the product by ID
        const product = await Product.findById(productId);
        // console.log( product)
        if (!product) {
           const message = 'Product not found' 
            return  res.render('adminSweetAlert.ejs', { message });
       
        }

        // Update product details
        product.title = title;
        product.desc = desc;
        product.price = price;
        product.stocks = stocks;
        // product.category = category;
        product.userCanVisible=userCanVisible;



        await product.save();
        res.redirect('/admin')
        // return res.status(200).json({ message: 'Product updated successfully' });
    } catch (err) {
        return  res.status(500).render('error', { error, status: 500 });
    }
}  
  

const productImageEdit = async (req, res) => {
    try {
        const adminId = req.session.admin_id;

        if (!adminId) {
            const message = "Admin not authenticated.";
            return res.render('adminSweetAlert.ejs', { message });
        }

        const productIdToUpdate = req.params.id;
        const imageIndex = req.params.index;

        if (req.file) {
            const image = req.file;
            const width = parseInt(req.query.width) || 250;
            const height = parseInt(req.query.height) || 250;
            const adminWidth = parseInt(req.query.adminWidth) || 100; // Use a separate query parameter for admin width
            const adminHeight = parseInt(req.query.adminHeight) || 100; // Use a separate query parameter for admin height

            // Process the uploaded image
            const processedImageURL = await processImage(image, width, height, false);
            const adminProcessedImageURL = await processImage(image, adminWidth, adminHeight, true);

            if (processedImageURL && adminProcessedImageURL) {
                const existingProduct = await Product.findById(productIdToUpdate);

                if (!existingProduct) {
                    const message = 'Product not found';
                    return res.render('adminSweetAlert.ejs', { message });
                }

                existingProduct.images[imageIndex] = processedImageURL;
                existingProduct.adminProductImage[imageIndex] = adminProcessedImageURL;

                await existingProduct.save();
            }

            res.redirect('/admin');
        } else {
            const message = "Please provide a new image for the product.";
            return res.render('adminSweetAlert.ejs', { message });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).render('error', { error, status: 500 });
    }
};

async function processImage(image, width, height, isAdmin) {
    try {
        const filePath = isAdmin
            ? `public/uploads/admin_cropped_${image.filename}`
            : `public/uploads/cropped_${image.filename}`;

        await sharp(image.path)
            .resize(width, height, { fit: 'cover' })
            .toFile(filePath);

        return isAdmin ? `/uploads/admin_cropped_${image.filename}` : `/uploads/cropped_${image.filename}`;
    } catch (error) {
        console.error(`Error processing image ${image.filename}: ${error.message}`);
        return null;
    }
}


const userSearchProducts = async (req, res) => {
    try {
        
       const { query } = req.query;
 
   const categories  =await Category.find()
   const wishlist  =await Wishlist.findOne({userId:req.session.user_id })
   const userData = await User.findOne({ _id: req.session.user_id }, { username: 1 });
       const searchResults = await Product.find({
           $or: [
               {  title:  { $regex: new RegExp(query, 'i') }  },
               {  price: { $regex: `${query}`, $options: 'i' } },
             
           ],
       });


    res.render("productSearch",{products:searchResults,username: userData.username,userData,categories,wishlist   })

     
   } catch (error) {
       console.error(error);
       return  res.status(500).render('error', { error, status: 500 });
   }
};

const generateStockReport = async (req, res) => {
    try {
      // Fetch all products and sort them by title in ascending order
      const products = await Product.find().sort({ title: 'asc' });
  
      // Create a new Excel workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Stock Report');
  
      // Define the columns in your Excel sheet
      worksheet.columns = [
        { header: 'Product Title', key: 'title', width: 30 },
        { header: 'Current Stock', key: 'stocks', width: 15 },
      ];
  
      // Add data to the worksheet
      products.forEach((product) => {
        worksheet.addRow({
          title: product.title,
          stocks: product.stocks,
        });
      });
  
      // Set the content type and headers for the response
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=stock-report.xlsx'
      );
  
      // Generate and send the Excel file to the client
      workbook.xlsx.write(res).then(() => {
        res.end();
      });
    } catch (error) {
      console.error('Error generating stock report:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  


module.exports = {
    uploadProduct,
    addProduct,

    productTable,
    productEdit,
    updateProduct ,
    productImageEdit,
    productDelete,
    
  
  
 
    productDetails,
    userSearchProducts ,
    generateStockReport 
}


