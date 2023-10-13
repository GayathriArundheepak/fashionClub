const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const Otp = require('../models/otp'); // Import your OTP model
const nodemailer = require('nodemailer');

require('dotenv').config();
const adminEmail = process.env.ADMIN_EMAIL;
// Create a transporter
const transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    requireTLSL:true,
  service: 'your-email-service-provider',
  auth: {
    
    user:"gayathri.a1804@gmail.com",
    pass: 'ugwonwxiwyvjqvnk'
  }
  
});
const sendOTPEmail = ( email,otp) => {

  const mailOptions = {
    from:"gayathri.a1804@gmail.com" ,
    to:   email ,
    subject: 'OTP Verification',
    text: `Your OTP for login is: ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};





// Generate and send OTP via email
const generateAndSendOTP = async (req, res) => {
  try {

    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
   
 
    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp,saltRounds);
    const newOtp = await new Otp({
 
      email:adminEmail,
    
      otp:hashedOtp,
      expiresAt: Date,
      createdAt:Date.now(),
        expiresAt:Date.now() + 60000,
    });
      // Calculate the expiration time (1 minute from now)
      const expirationTime = new Date(Date.now() + 60000);

      // Set a timer to delete the OTP document after 1 minute
      setTimeout(async () => {
        try {
          // Delete the OTP document
          await Otp.deleteOne({ email: adminEmail, createdAt: newOtp.createdAt });
        
        } catch (error) {
          console.error('Error deleting OTP:', error);
        }
      }, 60000);

    //save otp record
    await newOtp.save();
   
    
  // Send OTP via email

  sendOTPEmail(adminEmail , otp);

    res.render('verify-otp', { email:adminEmail });
} catch (error) {

      console.log(error.message);
      return  res.status(500).render('error', { error, status: 500 });
  }
};

// Render OTP input page
const renderOTPPage = (req, res) => {

  // const adminEmail = req.query.adminemail; // Get the adminemail from query parameter
  res.redirect("/admin/generate-otp");
};








const verifyOTP = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
   const  otp =req.body.otp;

    // Find the OTP record by email
    const otpRecord = await Otp.findOne({ email: adminEmail  });
  
    
    if (!otpRecord) {
     
      return res.render('verify-otp', {  errorMessage: 'OTP not found. Please generate a new OTP.' });
    }
    
    // Check if the OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      
     
      // Delete expired OTP documents
      const result = await Otp.deleteOne({ otp: otpRecord.otp});

      return res.render('verify-otp', {  errorMessage: 'OTP has expired. Please generate a new OTP.' });
    }

    // Verify the entered OTP against the hashed OTP in the record
    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
    // Delete expired OTP documents
    const result = await Otp.deleteOne({ otp: otpRecord.otp});

    
    if (isOtpValid) {
     
      // OTP is valid, proceed to the admin dashboard or the desired page
      // You can redirect the user or render a success page here
      // adminName = otpRecord.user_id
      res.redirect('/login');
      
    } else {
     
      // Incorrect OTP, render the verify-otp page with an error message
      return res.render('verify-otp', { errorMessage: 'Incorrect OTP. Please try again.' });
    }
  } catch (error) {
    console.error(error.message);
    return  res.status(500).render('error', { error, status: 500 });
  }
};


module.exports = {
  generateAndSendOTP,
  renderOTPPage,
  verifyOTP,
  sendOTPEmail
};

