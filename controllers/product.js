const Product = require('../models/product');
const Category = require('../models/category');
const User = require('../models/user');
const Wishlist = require('../models/wishlist');
const Cart = require('../models/cart');
const sharp = require('sharp');
// Assuming you have a model named Product that represents products in your database

// const uploadProduct = async (req, res) => {
//     try {
//         const { title, desc, price, stocks, category } = req.body;

//         // Check if a product with the same title already exists
//         const existingProduct = await Product.findOne({ title });

//         if (existingProduct) {
//             const message = "Product with the same title already exists.";
//             return res.render('adminSweetAlert.ejs', { message });
//         }

//         const adminId = req.session.admin_id;

//         if (!adminId) {
//             const message = "Admin not authenticated.";
//             return res.render('adminSweetAlert.ejs', { message });
//         }

//         // Use multer to handle file uploads
//         upload.array('images')(req, res, async (err) => {
//             if (err) {
//                 console.error(err.message);
//                 return res.status(500).render('error', { error: err, status: 500 });
//             }

//             // Extract uploaded files
//             const uploadedImages = req.files;

//             // Map the uploaded images to an array of objects containing image data and content type
//             const imageObjects = uploadedImages.map((image) => ({
//                 data: image.buffer, // Image data as buffer
//                 contentType: image.mimetype, // Content type (e.g., 'image/jpeg')
//             }));

//             // Create a new Product document with image data
//             const newProduct = new Product({
//                 title,
//                 desc,
//                 category,
//                 price,
//                 stocks,
//                 images: imageObjects, // Store the image data in the 'images' field
//             });

//             // Save the new product to MongoDB
//             await newProduct.save();

//             // Update the category's product count and add the product to the category's products array
//             await Category.findOneAndUpdate(
//                 { _id: category },
//                 {
//                     $inc: { productCount: 1 },
//                     $push: { products: newProduct },
//                 },
//                 { new: true }
//             );

//             res.redirect("/admin/add-product");
//         });
//     } catch (error) {
//         console.error(error.message);
//         return res.status(500).render('error', { error, status: 500 });
//     }
// };

// const uploadProduct = async (req, res) => {
//     try {
//         const { title, desc, price, stocks, category } = req.body;

//         // Check if a product with the same title already exists
//         const existingProduct = await Product.findOne({ title });

//         if (existingProduct) {
//             const message = "Product with the same title already exists.";
//             return res.render('adminSweetAlert.ejs', { message });
//         }

//         const adminId = req.session.admin_id;

//         if (!adminId) {
//             const message = "Admin not authenticated.";
//             return res.render('adminSweetAlert.ejs', { message });
//         }

//         // Check if new images are provided in the request
//         // if (req.files && req.files.length > 0) {
//         //     const images = req.files.map((file) => ({
//         //         data: file.buffer,
//         //         contentType: file.mimetype,
//         //     }));
  

//             /*const images = req.files.map((file)=>({
//             data:fs.readFileSync(path.join(__dirname+'../../public/uploads/'+file.filename)),
//             contentType:file.mimetype
//         }))*/
        
//         const uploadedImages = req.files;
        
//         const processedImageURLs = [];
    
//         // Process each uploaded image
//         for (const image of uploadedImages) {
//           // Use sharp to crop and resize the image
//           await sharp(image.path)
//             .resize(200, 200) // Set the desired dimensions
//             .toFile(`public/uploads/cropped_${image.filename}`); // Save the processed image
    
//           // Add the processed image's URL to the response
//           processedImageURLs.push(`/uploads/cropped_${image.filename}`);
//         }
    
// // const newProduct=new Products({name,price,category,subCategory,images:processedImageURLs,description})
//             // Create a new Product document with image data
//             const newProduct = new Product({
//                 title,
//                 desc,
//                 category,
//                 price,
//                 stocks,
//                 images:processedImageURLs, // Store the image data in the 'images' field
//             });

//             // Save the new product to MongoDB
//             await newProduct.save();

//             // Update the category's product count and add the product to the category's products array
//             await Category.findOneAndUpdate(
//                 { _id: category },
//                 {
//                     $inc: { productCount: 1 },
//                     $push: { products: newProduct },
//                 },
//                 { new: true }
//             );

//             res.redirect("/admin/add-product");
//         } else {
//             // Handle the case where no new images were provided
//             const message = "Please provide at least one image for the product.";
//             return res.render('adminSweetAlert.ejs', { message });
//         }
//     } catch (error) {
//         console.error(error.message);
//         return res.status(500).render('error', { error, status: 500 });
//     }
// };



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
const productImage = async (req, res) => {
    try {
        const productId = req.params.productId;
        const imageIndex = req.params.imageIndex;
        const adminId = req.session.admin_id;

        if (!adminId) {
            const message = "Admin not authenticated.";
            return res.render('adminSweetAlert.ejs', { message });
        }

        // Fetch the product from the database
        const product = await Product.findById(productId);

        if (!product || !product.images || product.images.length <= imageIndex) {
            const message = 'Image not found';
            return res.render('adminSweetAlert.ejs', { message });
        }

        const image = product.images[imageIndex];

        // Get the requested cropping dimensions (you can adjust these as needed)
        const width = parseInt(req.query.width) || 100; // Default width
        const height = parseInt(req.query.height) || 100; // Default height

        // Use sharp to resize and crop the image
        const croppedImageBuffer = await sharp(image.data)
            .resize(width, height, { fit: 'cover' }) // Crop to the specified dimensions
            .toBuffer();

        // Set the appropriate Content-Type header and send the cropped image
        res.set('Content-Type', image.contentType);
        res.send(croppedImageBuffer);
    } catch (error) {
        console.error(error.message);
        const message = 'Error fetching the image.';
        return res.render('adminSweetAlert.ejs', { message });
    }
};

//   user side
  const productImageUser = async (req, res) => {
    try {
        const productId = req.params.productId;

        // Fetch the product from the database
        const product = await Product.findById(productId);

        if (!product || !product.images || product.images.length === 0) {
            const message ='Image not found'
            return  res.render('userSweetAlert.ejs', { message });
        }

        // Get the 0th image from the product's images array
        const image = product.images[0];
          // Get the requested cropping dimensions (you can adjust these as needed)
      const width = parseInt(req.query.width) || 300; // Default width
      const height = parseInt(req.query.height) || 300; // Default height
  
      // Use sharp to resize and crop the image
      const croppedImageBuffer = await sharp(image.data)
        .resize(width, height, { fit: 'cover' }) // Crop to the specified dimensions
        .toBuffer();
  
      // Set the appropriate Content-Type header and send the cropped image
      res.set('Content-Type', image.contentType);
      res.send(croppedImageBuffer)

     
    } catch (error) {
        console.error(error.message);
        return  res.status(500).render('error', { error, status: 500 });
    }
};

const productDetails =async (req, res) => {
    try {
      
        const productId = req.params.productId;
        
    
        

    
    
        // const userData = await User.findById(userId); // Pass userId directly
        // console.log(userData);
        
      
        const product = await Product.findById(productId);
        const categories  =await Category.find()
        const wishlist  =await Wishlist.findOne()
        if (!product) {
         
            const message ='product not found'
            return  res.render('userSweetAlert.ejs', { message });
        }

        // Render the product details page and pass the product data to the template
        res.render('product-details', { product, username: null,categories,wishlist  });
    } catch (error) {
        console.error(error.message);
        return  res.status(500).render('error', { error, status: 500 });
    }
};



// const productDetails = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const productId = req.params.productId;
//         //   const size = req.body.size; // Assuming you're getting the size from the request body
        
//             const userData = await User.findById(userId); // Pass userId directly
//             const product = await Product.findById(productId);
//             const categories = await Category.find();
//             const wishlist = await Wishlist.findOne({ userId: req.session.user_id });
  
//       // Fetch the user's cart based on their user ID and populate the product data
//       const userCart = await Cart.findOne({ userId }).populate({
//         path: 'items.productId',
//         model: 'Product', // Reference to your product model
//       });
  
//       if (!userCart) {
//         // If the user doesn't have a cart yet, create a new one
//         const newCart = new Cart({
//           userId,
//           items: [
//             {
//               productId: product._id,
//               productName: product.title,
//             //   size,
//               quantity: 1,
//               price: product.price,
//             },
//           ],
//         });
  
//         await newCart.save();
//       } else {
//         // Check if the product is already in the user's cart
//         const existingCartItemIndex = userCart.items.findIndex(
//           (item) => item.productId._id.toString() === productId 
//         );
//         // && item.size === size
//         if (existingCartItemIndex !== -1) {
//           if (product.stocks <= userCart.items[existingCartItemIndex].quantity) {
//             const message = `Insufficient stock for product: ${product.title}`;
//             return res.render('userSweetAlert.ejs', { message });
//           }
  
//           // If found, increment the quantity by 1
//           userCart.items[existingCartItemIndex].quantity += 1;
//         } else {
//           // If not found, create a new cart item with a quantity of 1
//           const newCartItem = {
//             productName: product.title,
//             productId: product._id,
//             // size,
//             quantity: 1,
//             price: product.price,
//           };
  
//           userCart.items.push(newCartItem);
//         }
  
//         await userCart.save();
//       }
  
//       if (!product) {
//         const message = 'Product not found';
//         return res.render('userSweetAlert.ejs', { message });
//       }
  
//       // Render the product details page and pass the product data to the template
//       res.render('product-details', {
//         product,
//         username: userData.username,
//         userData,
//         categories,
//         wishlist,
//         cartItem: userCart.items.find(
//           (item) => item.productId._id.toString() === productId 
//         ),
//         // && item.size === size
//       });
//     } catch (error) {
//       console.error(error.message);
//       return res.status(500).render('error', { error, status: 500 });
//     }
//   };
  





// Function to render the admin list page
const productTable = async (req, res) => {
    try {
        const  adminId =req.session.admin_id
        if (!adminId) {
            const message = "admin not authenticated.";
           return  res.render('adminSweetAlert.ejs', { message });
          }
        // Fetch user details from the database
        const productDetails = await Product.find();
               
        
        res.render('product-list', { products: productDetails });
     
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
        const { title, description, price,stocks,
            userCanVisible
             } = req.body;
        console.log( productId)
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
        product.description = description;
        product.price = price;
        product.stocks = stocks;
        // product.category = category;
        product.userCanVisible=userCanVisible;



        await product.save();
        res.redirect('/admin//dashboard')
        // return res.status(200).json({ message: 'Product updated successfully' });
    } catch (err) {
        return  res.status(500).render('error', { error, status: 500 });
    }
}  
  
const productImageEdit = async (req, res) => {
    try {
        const productId = req.params.id;
        const  adminId =req.session.admin_id
        if (!adminId) {
            const message = "admin not authenticated.";
           return  res.render('adminSweetAlert.ejs', { message });
          }

        // Check if new images are provided in the request
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map((file) => ({
                data: file.buffer,
                contentType: file.mimetype,
            }));

            // Use findOneAndUpdate to find and update the product
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: productId },
                {
                    $set: {
                        'images.0': newImages[0], // Replace the 0th position
                        'images.1': newImages[1], // Replace the 1st position
                        'images.2': newImages[2], // Replace the 3rd position
                    },
                },
                { new: true } // Return the updated document
            );

            if (!updatedProduct) {
         const  message = 'Product not found' 
                return  res.render('adminSweetAlert.ejs', { message });
       
            }
        }

        // Redirect back to the admin dashboard or send a success response
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        return  res.status(500).render('error', { error, status: 500 });
    }
};

const userSearchProducts = async (req, res) => {
    try {
        
       const { query } = req.query;
   console.log(query)
   const categories  =await Category.find()
   const wishlist  =await Wishlist.findOne({userId:req.session.user_id })
   const userData = await User.findOne({ _id: req.session.user_id }, { username: 1 });
       const searchResults = await Product.find({
           $or: [
               {  title:  { $regex: new RegExp(query, 'i') }  },
               {  price: { $regex: `${query}`, $options: 'i' } },
             
           ],
       });

       console.log(searchResults )
    res.render("productSearch",{products:searchResults,username: userData.username,userData,categories,wishlist   })

     
   } catch (error) {
       console.error(error);
       return  res.status(500).render('error', { error, status: 500 });
   }
};

module.exports = {
    uploadProduct,
    addProduct,
    // listProduct,
    productTable,
    productEdit,
    updateProduct ,
    productImageEdit,
    productDelete,
    
  
    productImage,
    productImageUser,
    productDetails,
    userSearchProducts 
}