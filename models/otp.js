//otp model
const mongoose =require('mongoose');


const otpSchema = new  mongoose.Schema({
  
    email:String,
    otp:String,
    createdAt : Date,
    expiresAt: {
        type: Date,
        default: Date.now, // Set the initial value to the current time
        expires: '1m',     // Set the expiration time to 1 minute
      },

},{timestamps:true});

module.exports  =mongoose.model("Otp",otpSchema);