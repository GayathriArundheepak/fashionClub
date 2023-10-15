// require('dotenv').config()
const env = require("dotenv");
env.config();
const express = require("express");

// const path=require('path');
const app = express();
const mongoose = require("mongoose");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const cartRouter = require("./routes/cart");
const paymentRouter = require("./routes/payment");





// mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGO_URL , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.listen(3000, function () {
  console.log("server is running ");
});




app.use('/',userRouter);
app.use('/admin',adminRouter);
app.use('/cart',cartRouter);
app.use('/payment',paymentRouter);


