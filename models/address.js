const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
 userAddress: [{
  country:{type: String, required: true,},
  state: {type: String, required: true,},
  district: {type: String, required: true,},
  cityOrVillage: {type: String, required: true,},
  street: {type: String, required: true,},
  pin:{ type:Number},
  houseNO:{type: String},
  selected :{type:Boolean,default:false}
}],
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User', // Replace with your user model reference
  required: true,
},
});

module.exports = mongoose.model('Address', addressSchema);
