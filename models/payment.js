const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentType: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order', // Reference to the Payment schema
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
