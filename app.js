require('dotenv').config()
const express = require("express");

const path=require('path');
const app = express();
const mongoose = require("mongoose");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const cartRouter = require("./routes/cart");
const paymentRouter = require("./routes/payment");





mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.listen(8080, function () {
  console.log("server is running ");
});

//  const Razorpay = require('razorpay');

//      var instance = new Razorpay({
    
//        key_id: process.env.MYRAZORPAY_API_KEY,
//        key_secret: process.env.MYRAZORPAY_API_SECRET,
        
//     })

//     app.get('/payment',async (req, res) => {
//       res.sendFile("payment.html",{root :__dirname})
//     })
// const amount=5000;
// app.post('/create/orderId', async (req, res) => {
//   console.log('created orderId request Razaorpay', amount);
  
//   var order = {
//     amount: amount*100,  // amount in the smallest currency unit
//     currency: "INR",
//     receipt: "order_rcptid_11"
//   };
//   res.status(201).json({
//     sucess:true,
//     order:order,
//     amount:amount

//   })
//   instance.orders.create(options, function(err, order) {
//     console.log(order);
//     res.send({orderId:order.id})
//   });

// });




app.use('/',userRouter);
app.use('/admin',adminRouter);
app.use('/cart',cartRouter);
app.use('/payment',paymentRouter);


