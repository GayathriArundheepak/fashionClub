// models/Coupon.js

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
  },
  minOrderAmount: {
    type: Number,
    required: true,
  },
  user:[{
    type: String,
   
  }],
  expirationTime: {
    type: String,
    required: true,
},

},{ timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
