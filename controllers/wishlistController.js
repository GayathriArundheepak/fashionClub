
const Wishlist = require('../models/wishlist');
const Product = require('../models/product');
const User = require('../models/user');
const Category = require('../models/category');
const Cart = require('../models/cart');


const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const { size } = req.body;
        const userId = req.session.user_id; // Assuming userId is stored in the session after authentication
    
        // Find the product
        const product = await Product.findById(productId).exec();
    
        if (!userId) {
          const message = 'User not authenticated.';
          return  res.render('userSweetAlert.ejs', { message });
       
        }
    
        if (!product) {
          const message = 'Product not found.';
          return  res.render('userSweetAlert.ejs', { message });
        }
        
        // Check if the product is already in the user's wishlist
        
        const existingWishlistItem = await Wishlist.findOne({
          userId,
          'items.productId': productId,
        }).exec();
    
        if (existingWishlistItem) {
          const message = 'Product already exists in the wishlist.';
          return  res.render('userSweetAlert.ejs', { message });
        }
    
        // Create a new wishlist item
        const wishlistItem = {
          productId,
          size,
          productName: product.title,
          
        };
        const userWishlist = await Wishlist.findOneAndUpdate(
          { userId },
          {
            $push: { items: wishlistItem },
            $inc: { productCount: 1 }
          },
          { new: true }
          ).exec();
          
          if (!userWishlist) {
            // If the user doesn't have a wishlist yet, create a new one
            const newWishlist = new Wishlist({
              userId,
              productCount:1,
              items: [wishlistItem],
            });
            await newWishlist.save();
          }
          res.redirect("/")
        // const message = 'Product added to wishlist successfully.';
        // return res.status(200).json({ message });
      } catch (error) {
        console.error(error);
        return  res.status(500).render('error', { error, status: 500 });
    }
}

const viewWishlist = async (req, res) => {
    try {
      const userId = req.session.user_id; // Assuming userId is stored in the session after authentication
  
      if (!userId) {
        const message = 'User not authenticated.';
        return  res.render('userSweetAlert.ejs', { message });
      }
  
      // Find the user's wishlist and populate the product details
      const userWishlist = await Wishlist.findOne({ userId }).populate({
        path: 'items.productId',
        model: 'Product', // Reference to your product model
      });
  
      if (!userWishlist) {
        const message = 'Wishlist not found for the user.';
        return  res.render('userSweetAlert.ejs', { message });
      }
      const userData = await User.findOne({ _id: req.session.user_id }, { username: 1 });
      const categories  =await Category.find()
      const cartData = await Cart.findOne({ userId: req.session.user_id }).populate({
        path: 'items.productId',
        model: 'Product', // Reference to your product model
      });
        res.render("wishlist", {wishlist: userWishlist,username: userData.username,userData,categories,cartData})
      // Return the user's wishlist data
    //   return res.status(200).json({ wishlist: userWishlist.items });
    } catch (error) {
      console.error(error);
      return  res.status(500).render('error', { error, status: 500 });
    }
  }
  const removeFromWishlist = async (req, res) => {
    try {
        const wishlistItemId = req.params.wishlistItemId;
        const userId = req.session.user_id; // Assuming userId is stored in the session after authentication

        if (!userId) {
            const message = 'User not authenticated.';
            return  res.render('userSweetAlert.ejs', { message });
           
        }

        // Find the user's wishlist and remove the item by wishlistItemId
        const userWishlist = await Wishlist.findOneAndUpdate(
            { userId },
            { $pull: { items: { _id: wishlistItemId } }, $inc: { productCount: -1 } },
            { new: true }
        );

        if (!userWishlist) {
            const message = 'Wishlist not found for the user.';
            return  res.render('userSweetAlert.ejs', { message });
        }
          res.redirect("/cart/wishlist")
        // res.status(200).json({ message: 'Item removed from wishlist successfully.' });
    } catch (error) {
        console.error(error);
        return  res.status(500).render('error', { error, status: 500 });
    }
};

module.exports={
    addToWishlist,
    viewWishlist,
    removeFromWishlist 
} 
