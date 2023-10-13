const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const Order = require('../models/order'); // Adjust the path as needed
const User = require('../models/user'); // Adjust the path as needed
const Payment = require('../models/payment'); // Adjust the path as needed
const Wallet = require('../models/wallet'); // Import your Wallet model
const Product = require('../models/product');
// Retrieve orders for a specific user
const getUserOrders = async (req, res) => {
  try {
    const userId = req.session.user_id; 
    const orders = await Order.find({ userId }).sort('-createdAt').populate('paymentId'); // Sort by creation date, newest first
  
  
   res.render("userOrders",{orders})
  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};




// Retrieve all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const  adminId =req.session.admin_id
    const page = parseInt(req.query.page) || 1; // Get the requested page number
    const perPage = 5; // Number of items to display per page

   
            
  const totalItems = await Order.countDocuments();
  const totalPages = Math.ceil(totalItems / perPage);
    if (!adminId) {
        const message = "admin not authenticated.";
       return  res.render('adminSweetAlert.ejs', { message });
      }
      const orders = await Order.find()
                                .sort('-createdAt')
                                .skip((page - 1) * perPage)
                                .limit(perPage);
              

    


    res.render("adminOrders",{ orders  ,page,
      totalPages });
  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};

// Edit order status (admin)
const editOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;
    const deliveredDate = Date.now(); // Get the current date and time
    const  adminId =req.session.admin_id
    if (!adminId) {
        const message = "admin not authenticated.";
       return  res.render('adminSweetAlert.ejs', { message });
      }

    if (!orderId || !orderStatus) {
      const message = 'Missing orderId or orderStatus' 
      return res.render('AdminSweetAlert.ejs', { message });
    }
    if(orderStatus === "Delivered"){
    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus, deliveredDate }, // Update both orderStatus and deliveredDate
      { new: true }
    );
    }else{
    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus, deliveredDate:null }, // Update both orderStatus and deliveredDate
      { new: true }
      )}
  
  
    res.redirect("/admin/orders");
  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};

const orderCancel = async (req, res) => {
  try {
    const { orderId } = req.body; // Get the order ID from the request
  
    const order = await Order.findById(orderId);

    res.render("cancel-order-confirmation",{  orderId,order  });
  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
}




const cancelItem = async (req, res) => {
  try {
    
    const userId = req.session.user_id; // Replace with your user identification logic
    const { orderId, productId,productName, cancelledProductQuantity, cancelledProductPrice } = req.body;
  

     // Calculate the amount to subtract from the total amount
    const amountToSubtract = cancelledProductQuantity * cancelledProductPrice;

    // Update the Order document to reduce the total amount
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          products: {quantity:cancelledProductQuantity,
            productName:productName,
            price:cancelledProductPrice,
             itemOrderStatus :'cancelled' }
        },
        $inc: { amount: -amountToSubtract },
       
      },
      { new: true }
    );
  // Check if all itemOrderStatus values are 'cancelled'
const allCancelled = updatedOrder.products.every(product => product.itemOrderStatus === 'cancelled');
if (allCancelled) {
  // Update the order status to 'cancelled'
  await Order.findByIdAndUpdate(
    orderId,
    { $set: { orderStatus: 'cancelled' } },
    { new: true }
  );
}

    // Check if the order was updated successfully
    if (!updatedOrder) {
      throw new Error('Order not found.');
    }

    
   
    const order = await Order.findById(orderId).populate('paymentId');
  
    if (!order) {
      
      const message = 'Order not found. ';
      return res.render('userSweetAlert.ejs', { message });
    }
  
    const paymentType = order.paymentId.paymentType;

if(paymentType!=="COD"){

    // Query the user's wallet
    let userWallet = await Wallet.findOne({ userId });

    // If the user doesn't have a wallet, create one
    if (!userWallet) {
      userWallet = new Wallet({ userId });
      await userWallet.save();
    }

    // Deduct the amount from the user's wallet balance
    userWallet.balance += amountToSubtract;

    // Save the updated wallet balance
    await userWallet.save();
      // Now, update the product's stock
  }
      const updatedProduct = await Product.findOneAndUpdate(
        { title: productName },
        {
          $inc: { stocks: +cancelledProductQuantity }
        },
        { new: true }
      );

   if(paymentType!=="COD"){
      if (!updatedProduct) {
        
    const message = `Item cancelled successfully. Updated wallet balance: ${userWallet.balance}`;
    return res.render('userSweetAlert.ejs', { message });
      }

    const message = `Item cancelled successfully. Updated wallet balance: ${userWallet.balance}`;
    return res.render('userSweetAlert.ejs', { message });
    }else{
      const message = 'Item cancelled successfully. ';
      return res.render('userSweetAlert.ejs', { message });
    }   
  } catch (error) {
    console.error(error);
    return res.status(500).render('error', { error, status: 500 });
  }
}



const downloadSalesReport = async (req, res) => {
  try {
    // Extract year and month from the request parameters
    const year  =req.body.year
      const month = req.body.month

    // Parse year and month as integers
    const selectedYear = parseInt(year, 10);
    const selectedMonth = parseInt(month, 10);

    // Calculate the start and end date for the selected month
    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);

    // Fetch orders data for the selected month
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate('paymentId');

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');
 
    // Define the columns in your Excel sheet
    worksheet.columns = [
      // { header: 'Order ID', key: 'orderId', width: 20 },
      // { header: 'Customer Name', key: 'customerName', width: 20 },
      { header: 'Order Date', key: 'orderDate', width: 20 },
      { header: 'Order Status', key: 'orderStatus', width: 15 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 },
      { header: 'Product Name', key: 'productName', width: 20 },
      { header: 'Quantity Sold', key: 'quantitySold', width: 15 },
      { header: 'Total Amount', key: 'amount', width: 15 },
    ];


    // Calculate the sum of column G (amount) values
const columnG = worksheet.getColumn('G');
let sumOfColumnG = 0;

// Iterate through each cell in column G
columnG.eachCell((cell, rowNumber) => {
  // Skip the header row (rowNumber 1)
  if (rowNumber > 1) {
    const amount = parseFloat(cell.value); // Assuming values are numeric
    if (!isNaN(amount)) {
      sumOfColumnG += amount;
    }
  }
});



  // Add data to the worksheet
orders.forEach((order) => {
  let totalOrderAmount = 0; // Initialize the total order amount for each order
  order.products.forEach((product) => {
    const amount = product.price * product.quantity;
    totalOrderAmount += amount; // Calculate the total order amount
    worksheet.addRow({
      // orderId: order._id.toString(),
      // customerName: order.customerName,
      orderDate: order.createdAt.toISOString().split('T')[0], // Format date as 'YYYY-MM-DD'
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentId.paymentType,
      productName: product.productName,
      quantitySold: product.quantity,
      amount: amount, // Add the amount for each product
      
    });
  });

  // // Add an empty row to separate order-specific data
  // worksheet.addRow({});
});

    // Set the content type and headers for the response
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=sales-report-${selectedYear}-${selectedMonth}.xlsx`
    );

    // Generate and send the Excel file to the client
    workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const  downloadCancelReport = async (req, res) => {
  try {
    const year = req.body.year;
    const month = req.body.month;
    const selectedYear = parseInt(year, 10);
    const selectedMonth = parseInt(month, 10);
    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);

    // Fetch canceled orders data for the selected month
    const canceledOrders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      'products.itemOrderStatus': 'cancelled', // Filter canceled orders
    }).populate('paymentId');

    // Check if there are canceled orders to generate a report
    if (canceledOrders.length === 0) {
      return res.status(404).json({ message: 'No canceled orders found for the selected month.' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Canceled Orders Report');

    worksheet.columns = [
      { header: 'Order Date', key: 'orderDate', width: 20 },
      { header: 'Order Status', key: 'orderStatus', width: 15 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 },
      { header: 'Product Name', key: 'productName', width: 20 },
      { header: 'Quantity Sold', key: 'quantitySold', width: 15 },
      { header: 'Total Amount', key: 'amount', width: 15 },
    ];

    canceledOrders.forEach((order) => {
      order.products.forEach((product) => {
        const amount = product.price * product.quantity;
        worksheet.addRow({
          orderDate: order.createdAt.toISOString().split('T')[0],
          orderStatus: order.orderStatus,
          paymentMethod: order.paymentId.paymentType,
          productName: product.productName,
          quantitySold: product.quantity,
          amount: amount,
        });
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=canceled-report-${selectedYear}-${selectedMonth}.xlsx`
    );

    workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    console.error('Error generating canceled orders report:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
module.exports = {

 // userside
  getUserOrders,
  orderCancel,
 
  cancelItem,
 

//   adminside
  getAllOrders,
  editOrderStatus,
  downloadSalesReport,
  downloadCancelReport
};




