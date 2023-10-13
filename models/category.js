const mongoose = require('mongoose');

// const subcategorySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     unique: true,
//   },
// });

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  productCount:{
    type: Number,
    default: 0,
 },
 
  products: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference to your product model
    },
    
});

module.exports = mongoose.model('Category', categorySchema);
