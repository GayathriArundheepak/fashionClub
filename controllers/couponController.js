// controllers/couponController.js

const Coupon = require('../models/coupon');
const Product = require('../models/product');
const Cart = require('../models/cart');
const Payment = require('../models/payment');
const Order = require('../models/order');
const User = require('../models/user');
const Address = require('../models/address');
const Category = require('../models/category');





const renderCreateCouponPage = (req, res) => {
  const  adminId =req.session.admin_id
  if (!adminId) {
      const message = "admin not authenticated.";
     return  res.render('paymentSweetAlert.ejs', { message });
    }
  res.render('coupon'); // 'createCoupon' should match the name of your EJS template file without the ".ejs" extension
};


const  createCoupon= async (req, res) => {
    try {
      const  adminId =req.session.admin_id
      if (!adminId) {
          const message = "admin not authenticated.";
         return  res.render('adminSweetAlert.ejs', { message });
        }
      const { code, discountPercentage, minOrderAmount,expirationTime } = req.body;
      // Check if the coupon code already exists
      const existingCoupon = await Coupon.findOne({ code });
      if (existingCoupon) {
        const  message = 'Coupon code already exists' 
        return res.render('paymentSweetAlert', { message });
      }

      const newCoupon = new Coupon({ code, discountPercentage, minOrderAmount,expirationTime });
      await newCoupon.save();

      const message= 'Coupon created successfully' 
      return res.render('paymentSweetAlert', { message });
    } catch (error) {
      console.error(error);
      return  res.status(500).render('error', { error, status: 500 });
    }
  }




  const  applyCoupon = async (req, res) => {
    try {
      
      const orderAmount =req.params.orderAmount ;
      const { couponCode} = req.body;



        // Retrieve the user's cart based on their user ID (you may need to modify this)
    const userId = req.session.user_id; // Assuming userId is stored in the session after authentication
    const userCart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product', // Reference to your product model
    });

      // Find the coupon by code
      const coupon = await Coupon.findOne({ code: couponCode });

      if (!coupon) {

       const  message = 'Coupon not found' 
        return res.render('paymentSweetAlert', { message })
      }

      if (orderAmount < coupon.minOrderAmount) {
        const  message= 'Order amount does not meet the coupon criteria' 
        return res.render('paymentSweetAlert', { message });
      }
      // Check if the user has already used the coupon
      if (coupon.user.includes(userId)) {
        message= 'You have already used this coupon'  
        return res.render('paymentSweetAlert', { message });
       }else{
        await Coupon.findOneAndUpdate(
          { code: couponCode },
          { $push: { user: userId } },
          { upsert: true }
       )}
       const currentDate = new Date();
         const expirationDate = new Date(coupon.expirationTime);

        if (currentDate > expirationDate) {
          message = 'This coupon has expired' 
          return res.render('paymentSweetAlert', { message });
        }

      // Calculate the discount
      const discountAmount = Math.round((coupon.discountPercentage / 100) * orderAmount);
     

      
      res.redirect(`/cart/checkout?discountAmount=${ discountAmount }&couponCode=${couponCode}`);

    } catch (error) {
      console.error(error);
      return  res.status(500).render('error', { error, status: 500 });
    }
  }




  const removeCoupon = async (req, res) => {
    try {
      const { couponCode } = req.body;

      // Retrieve the user's cart based on their user ID (you may need to modify this)
      const userId = req.session.user_id; // Assuming userId is stored in the session after authentication
      const userCart = await Cart.findOne({ userId }).populate({
        path: 'items.productId',
        model: 'Product', // Reference to your product model
      });
      const coupons = await Coupon.find();
  
      // Fetch addresses associated with the user from the database
      const addresses = await Address.find({ userId }, { userAddress: 1 });
      const categories = await Category.find();
      const userData = await User.findOne({ _id: req.session.user_id }, { username: 1 });
      
      const trimmedCouponCode = couponCode.trim();

      // Find the coupon by code
      const coupon = await Coupon.findOne({ code: trimmedCouponCode });
     
      if (!coupon) {
        const message = 'Coupon not found';
        return res.status(400).json({ message });
      }

      // Check if the user has already used the coupon and remove it
      if (coupon.user.includes(userId)) {
        await Coupon.findOneAndUpdate(
          { code:trimmedCouponCode   },
          { $pull: { user: userId } }
        );
        discountAmount=0 
     
        res.redirect(`/cart/checkout?discountAmount=${ discountAmount }&couponCode=${couponCode}`);
      };
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }


const couponList =async (req, res) => {
  try{
      // Find the coupon by code
      const coupons = await Coupon.find();
      res.render("couponList",{coupons })
  }catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
}

  module.exports =
 {
  renderCreateCouponPage,
    applyCoupon,
    removeCoupon, 
    createCoupon,
     couponList    

}



