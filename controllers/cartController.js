const Product = require('../models/product');
const Cart = require('../models/cart');
const Payment = require('../models/payment');
const Order = require('../models/order');
const User = require('../models/user');
const Address = require('../models/address');
const Category = require('../models/category');
const Coupon = require('../models/coupon');
const Wishlist = require('../models/wishlist');
const Wallet = require('../models/wallet');
const Banner = require('../models/banner');

const Razorpay = require('razorpay');

const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const size = req.body.size;
    const userId = req.session.user_id; // Assuming userId is stored in the session after authentication
    const product = await Product.findById(productId).exec();

    if (!userId) {
      const message = "User not authenticated.";
     return  res.render('userSweetAlert.ejs', { message });
    }
    
    
    if (!product) {
      const message ='Product not found.'
      return res.render('userSweetAlert.ejs', { message });
    
    }
 if (product.stocks===0  ) {
  const message ="Sorry, OUT OFF STOCK"
  
  return res.render('userSweetAlert.ejs', { message });
  
      
    }
    
    // Fetch the user's cart based on their user ID and populate the product data
    const userCart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product', // Reference to your product model
    });


  
    if (!userCart) {
      // If the user doesn't have a cart yet, create a new one
      const newCart = new Cart({
        userId,
        items: [
          {
            productId: product._id,
            productName: product.title,
            size:size,
            quantity: 1,
            price:product.price,
            
          },
        ],
        productCount:1
      });
      
      await newCart.save();
      
     
    } else {

     

      // Check if the product is already in the user's cart
      const existingCartItemIndex = userCart.items.findIndex(
        (item) => item.productId._id.toString() === productId
      );
 
      if (existingCartItemIndex !== -1) {
       
        if (product.stocks <=  userCart.items[existingCartItemIndex].quantity ) {
    
        
              const message =`Insufficient stock for product: ${product.title}`
              return res.render('userSweetAlert.ejs', { message });
    
           
             }
            
              //  If found, increment the quantity by 1
               userCart.items[existingCartItemIndex].quantity += 1;
             

      } else {
        // If not found, create a new cart item with a quantity of 1
        const newCartItem = {
          productName: product.title,
          productId: product._id,
          // size:size,
          quantity: 1,
          price: product.price,

        };

        userCart.items.push(newCartItem);
        userCart.productCount += 1;
     
      }

      await userCart.save();
    }

    // Redirect the user to the cart view
   return res.redirect('/');
  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};


const calculateTotalPrice = (userCart) => {
  if (!userCart || !userCart.items || userCart.items.length === 0) {
    return 0; // Return 0 if the cart is empty or invalid
  }

  // Calculate the total price by summing the price of each cart item
  const totalPrice = userCart.items.reduce((total, item) => {
    return total + item.quantity * item.productId.price;
  }, 0);

  return totalPrice;
};

// View shopping cart
const viewCart = async (req, res) => {
  try {
    const wishlist  =await Wishlist.findOne({userId:req.session.user_id })
    // Retrieve cart data from the Cart collection based on the user's session and populate the product data
    const cartData = await Cart.findOne({ userId: req.session.user_id }).populate({
      path: 'items.productId',
      model: 'Product', // Reference to your product model
    });



    // Calculate the total price of cart items
    const totalPrice = calculateTotalPrice(cartData);
    const userData = await User.findOne({ _id: req.session.user_id }, { username: 1 });
    
    const categories  =await Category.find()
    // Render the view-cart template with cartData and totalPrice
    res.render('view-cart', { cartData, totalPrice,username: userData.username,userData,categories,wishlist  });
  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};





const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.session.user_id; // Assuming userId is stored in the session after authentication

    if (!userId) {
      const message = "User not authenticated.";
      return res.render('userSweetAlert.ejs', { message });
    }

    // Find the user's cart based on their userId
    const userCart = await Cart.findOne({ userId });

    if (!userCart) {
      const message = 'Cart not found.';
     
      return res.render('userSweetAlert.ejs', { message });
   
    }

    // Filter out the item with the specified _id and update the user's cart
    userCart.items = userCart.items.filter((item) => item._id.toString() !== itemId);
    userCart.productCount -= 1;
    // Save the updated cart
    await userCart.save();

    return res.redirect('/cart/view-cart'); // Redirect to the cart view
  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};




const incrementQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.session.user_id; // Assuming userId is stored in the session after authentication
    
    if (!userId) {
      const message = "User not authenticated.";
      return res.render('userSweetAlert.ejs', { message });
    
    }

    // Find the user's cart based on their userId and populate the product data
    const userCart = await Cart.findOne({ userId })
    

    if (!userCart) {
      const message = 'Cart not found.';
      return res.render('userSweetAlert.ejs', { message });
      
    }
    
    
    // Find the cart item by productId and increment the quantity
    
    const cartItem = userCart.items.find((item) => item._id.toString() === itemId);
    
    const IdOfProduct =  cartItem.productId._id
    const product = await Product.findById(IdOfProduct )
   
    if (cartItem) {
     
      if (product.stocks <=  cartItem.quantity ) {

            const message =`Insufficient stock for product: ${product.title}`
            return res.render('userSweetAlert.ejs', { message });
  
      }
      cartItem.quantity += 1;

      // Save the updated cart
      await userCart.save();

      // Redirect to the cart view
      return res.redirect('/cart/view-cart');
    } else {
      const message = 'Item not found in the cart.';
      return res.render('userSweetAlert.ejs', { message });

    }
  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};


// decrement of Quantity 

const decrementQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.session.user_id; // Assuming userId is stored in the session after authentication

    if (!userId) {

      const message = 'User not authenticated.';
      return res.render('userSweetAlert.ejs', { message });
   
    }

    // Find the user's cart based on their userId and populate the product data
    const userCart = await Cart.findOne({ userId })

    if (!userCart) {
      const message = 'Cart not found.';
      return res.render('userSweetAlert.ejs', { message });
     
    }

    // Find the cart item by productId and increment the quantity
    const cartItem = userCart.items.find((item) => item._id.toString() === itemId);

    if (cartItem) {
      if(cartItem.quantity>1){
      cartItem.quantity -= 1;
      
      await userCart.save();
      }
     

      // Redirect to the cart view
      return res.redirect('/cart/view-cart');
    } else {
      const message = 'Item  not found in the Cart.';
      return res.render('userSweetAlert.ejs', { message });
    }
  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};



const  checkoutPage =async (req, res) => {
  try {
   
    const userId = req.session.user_id; 
    if (!userId) {

      const message = 'User not authenticated.';
      return res.render('userSweetAlert.ejs', { message });
   
    }
    const discountAmount = parseInt(decodeURIComponent(req.query.discountAmount || 0));
    const couponCode =req.query.couponCode|| 0
  

    const cartData = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product', // Reference to your product model
    });

    const wishlist  =await Wishlist.findOne({userId:req.session.user_id })
    
      const coupons= await Coupon.find();

      const addresses = await Address.find({ userId },{userAddress:1});
 
      const userData = await User.findOne({ _id: req.session.user_id }, { username: 1 });
    
      const categories  =await Category.find()

  

    // Calculate the total price of items in the cart (you may have a function for this)
    const totalPrice = calculateTotalPrice(cartData);

 

  const maxMinOrderAmount = await Coupon.aggregate([
    {
      $match: {
        minOrderAmount: { $lt: totalPrice } // Filter coupons with minOrderAmount less than totalAmount
      }
    },
    {
      $group: {
        _id: null,
        maxMinOrderAmount: { $max: "$minOrderAmount" } // Find the maximum minOrderAmount
      }
    }
  ]);
  const MYRAZORPAY_API_KEY = process.env.MYRAZORPAY_API_KEY;
  // Extract the maximum minOrderAmount from the result
  const maxAmount = maxMinOrderAmount[0]?.maxMinOrderAmount || 0;


  
  res.render('checkout', { 
    cartData,
    totalPrice,
    addresses,
    categories, 
    username:userData.username,
    coupons,
    couponCode,
    maxAmount,
    discountAmount,
  wishlist,MYRAZORPAY_API_KEY });

    // Render the checkout page EJS template with cart data and total price
  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};

const clearUserCart = async (userId) => {
  try {
    // Find the user by ID and clear their cart
    const user = await User.findById(userId).exec();

    if (user) {
     // Find the user's cart based on their userId and delete it
await Cart.deleteOne({ userId });
    }
  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};


const checkoutSubmission = async (req, res) => {
  try {
    const paymentType = req.body.paymentType;
    const totalPrice = req.params.totalPrice;
  
    const userId = req.session.user_id; 
    if (!userId) {

      const message = 'User not authenticated.';
      return res.render('userSweetAlert.ejs', { message });
   
    }
    
    const products = await Cart.findOne({ userId }, { items: 1 });
    const address = await Address.findOne({ userId });

    if (!address) {
      const message ='No addresses found ';
      return res.render('userSweetAlert.ejs', { message });
     
    }
    

    // Use the filter method to select addresses with selected:true
const selectedAddresses = address.userAddress.filter(address => address.selected === true);
if (selectedAddresses=== 0) {
  const message ='No addresse selected ';
  return res.render('userSweetAlert.ejs', { message });
 
}

if (!products || !products.items) {

  return res.redirect("/");
}


    // Check and update product stocks
    for (const item of products.items) {
      const product = await Product.findById(item.productId);

      if (!product) {
    const    message =`Product with ID ${item.productId} not found.`
        return res.render('userSweetAlert.ejs', { message });
      }

      // Check if the product has sufficient stock
      if (product.stocks < item.quantity) {
        // Insufficient stock for this product, handle accordingly (e.g., show an error message)
        const message =`Insufficient stock for product: ${product.title}`
        return res.render('userSweetAlert.ejs', { message });
      }

      // Deduct the stock
      product.stocks -= item.quantity;
      await product.save();
    }

    
    // Assuming 'products' is the data you want to use to create the order
    const productsData = products.items.map(item => ({
      quantity: item.quantity,
      price: item.price || 0,
      itemOrderStatus: "pending"|| '',
      productName: item.productName ||"***" ,
    }));


  const selectedAddress = selectedAddresses[0];


  // // Now you can access the individual fields of the selected address
  // const { country, state, district, cityOrVillage, street, pin, houseNO } = selectedAddress;
  if (selectedAddress) {
    const { country, state, district, cityOrVillage, street, pin, houseNO } = selectedAddress;

  } else {
    
  
    const message = "Please select an address before proceeding.";
    return res.render('userSweetAlert.ejs', { message });
  }
  

    // Create a new order based on the user's session data
    const newPayment = new Payment({
      userId,
      paymentType,

      // Add any other fields you need for the payment record
    });

    // Save the new payment to the database
    try {
      await newPayment.save();
  
    } catch (error) {
      console.error('Error creating payment record:', error);
      return  res.status(500).render('error', { error, status: 500 });
    }
 
    
// Convert the userId to a string
const userIdString = userId.toString();

// Retrieve the customerName (username) by querying the User model
const customer = await User.findById(userIdString, 'username');

// Access the username from the customer document
const customerName = customer ? customer.username : null;
    const newOrder = new Order({
      userId,
      customerName,
      amount: totalPrice,
      products: productsData,
      orderStatus: 'Pending',
      address:selectedAddress ,
      paymentId:newPayment._id
     
    });

    // Save the new order to the database
    await newOrder.save();


    // Clear the user's cart (you may have a function for this)
    // Note: You need to implement a function to clear the user's cart based on their userId
    await clearUserCart(userId);
    

    // Internet Transaction

try{
      if ( paymentType === 'UPI') {

      
      const amount = req.params.totalPrice;
      var instance = new Razorpay({
       
          key_id: process.env.MYRAZORPAY_API_KEY,
          key_secret: process.env.MYRAZORPAY_API_SECRET,
      })
    
  
      const order = await instance.orders.create({
        amount: amount * 100,
        currency: 'INR',
       
      });
     
    
     
        return res.render('paymentSucess', { paymentType,   razorPaySucess: true,
          order,
          amount, });
       


      // wallet transaction
    }else if (paymentType === 'wallet') {
      // Query the user's wallet
      const userWallet = await Wallet.findOne({ userId });
    
      if (!userWallet) {
        throw new Error('User does not have a wallet.');
      }
 
      // Check if the wallet balance is sufficient
      if (userWallet.balance >= totalPrice) {
        // Deduct the totalPrice from the wallet balance
        userWallet.balance -= totalPrice;
      
    
        // Save the updated wallet balance
        await userWallet.save();
    
        // You can now proceed to create the order or perform any other necessary actions
      
    
        return res.render('paymentSucess', { paymentType,wallet:userWallet  });
       
      } else {
        throw new Error('Insufficient funds in wallet.');
      }
    }else if(paymentType === 'COD'){
      const message = "Order placed successfully."
      return res.render('paymentSucess', { paymentType  });
    }else {
      throw new Error('Payment method is not valid.');
    }
  } catch (error) {
    console.error('Razorpay Error:', error);
    return  res.status(500).render('error', { error, status: 500 });
  }
  

  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};






module.exports = {
    addToCart,
    viewCart ,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    checkoutPage,
    checkoutSubmission,
    
}