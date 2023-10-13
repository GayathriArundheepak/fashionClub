const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to your product model
    required: true,
  },
  size: { type: String },
  productName: { type: String },
});

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Replace with your user model reference
    required: true,
  },
  productCount:{type:Number,require:true},
  items: [wishlistItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
