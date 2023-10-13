const express = require("express");
const session =require('express-session')
const path=require('path');


const cartController = require("../controllers/cartController");
const userController = require("../controllers/userController");
const wishlistController = require("../controllers/wishlistController");

// const auth=require('../middleware/user')



const router=express();
router.set("view engine", "ejs");
router.set('views','./views/user');

router.use (session({
    secret:process.env.SESSION_SECRET,
    cookie:{sameSite:'strict'},
    saveUninitialized:true,
    resave:false}))

router.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
  res.header('Expires', '0');
  res.header('Pragma', 'no-cache');
  next();
});



router.use(express.urlencoded({ extended: true }));
router.use(express.static("public"));
router.use(express.json());
router.use(express.static(path.join(__dirname,'public')));
router.use( '/css',express.static(path.join(__dirname, '../public')))


// Add product to cart
router.get('/add-to-cart/:productId', cartController.addToCart);
// View shopping cart
router.get('/view-cart', cartController.viewCart);
// Remove one quantity of a product from the cart
router.post('/remove-from-cart/:itemId', cartController.removeFromCart);
// Increment quantity by 1
router.post('/increment-quantity/:itemId',cartController.incrementQuantity);
// Decrement quantity by 1
router.post('/decrement-quantity/:itemId',cartController.decrementQuantity );

// Define a route for the checkout page
router.get('/checkout',cartController.checkoutPage)

// Add a route to handle the checkout form submission
router.post('/checkoutSubmission/:totalPrice',cartController.checkoutSubmission)



// POST route to add a product to the wishlist
router.get('/add-to-wishlist/:productId',wishlistController.addToWishlist)
router.get('/wishlist',wishlistController.viewWishlist)
// router.get('/wishlist/remove/:wishlistItemId ',wishlistController.removeFromWishlist)
router.post('/wishlist/remove/:wishlistItemId', wishlistController.removeFromWishlist);


module.exports = router