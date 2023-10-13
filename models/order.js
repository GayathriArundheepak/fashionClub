const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName:{
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Replace with your user model reference
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  products: [
    {
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      productName: {
        type: String,
        required: true,
      },
      itemOrderStatus: {
        type: String,
        required: true,
      },
     
    },
  ],
  orderStatus: {
    type: String,
    required: true,
  },
  deliveredDate: {
    type: Date,
    default:null
    
  },
  
  address:[
    {
      houseNO:{type: String},
      cityOrVillage: {type: String, required: true,},
      street: {type: String, required: true,},
      district: {type: String, required: true,},
      state: {type: String, required: true,},
      country:{type: String, required: true,},
      pin:{ type:Number},
    }
  ],
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment', // Reference to the Payment schema
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
