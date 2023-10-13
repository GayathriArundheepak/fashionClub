const express = require("express");
const session =require('express-session')
const path=require('path');


const cartController = require("../controllers/cartController");
const userController = require("../controllers/userController");
const wishlistController = require("../controllers/wishlistController");
const paymentController = require("../controllers/paymentController");
const couponController = require("../controllers/couponController");

// const auth=require('../middleware/user')



const router=express();
router.set("view engine", "ejs");
router.set('views','./views/payment');

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



router.get('/generate-invoice/:orderId',paymentController.generateInvoice )



router.get('/coupons',couponController.couponList  )
router.get('/get-create-coupon',couponController.renderCreateCouponPage  )
router.post('/create-coupon',couponController.createCoupon )
router.post('/apply-coupon/:orderAmount',couponController.applyCoupon )
router.post('/remove-coupon/:orderAmount',couponController.removeCoupon )
  


module.exports = router