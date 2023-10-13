

const mongoose = require('mongoose');



const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to your product model
    required: true,
  },
  quantity:{ type:Number},
  price:{ type:Number},
   size:{ type:String},
  productName:{type:String},

});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Replace with your user model reference
    required: true,
  },
  productCount:{type:Number,require:true},
  items: [cartItemSchema],
},{timestamps:true});

module.exports = mongoose.model('Cart', cartSchema);









