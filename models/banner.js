const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  imageUrl:[ {
    type: String,
    required: true,
  }],
  description: {
    type: String, // You can customize this field based on your requirements.
    required: true,
  },
  buttonText: {
    type: String, // The text for the button (e.g., "Shop Now").
    required: true,
  },
  buttonLink: {
    type: String, // The URL the button links to.
    required: true,
  },
  isActive: {
    type: Boolean, // Indicates whether the banner is currently active or not.
    default: true, // You can set a default value.
  },
});

module.exports = mongoose.model('Banner', bannerSchema);
