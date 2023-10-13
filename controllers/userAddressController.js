const Address = require('../models/address'); // Import your Address model
const User = require('../models/user'); // Import your user model
const Category = require('../models/category'); // Import your user model
const Wishlist = require('../models/wishlist');
const Wallet = require('../models/wallet');
const Cart = require('../models/cart');


// Retrieve user addresses
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.session.user_id; // Assuming userId is stored in the session after authentication

    // Fetch addresses associated with the user from the database
    const userData = await User.findOne({ _id: req.session.user_id }, { username: 1 });
    const wishlist  =await Wishlist.findOne({userId:req.session.user_id })  
    const addresses = await Address.find({ userId: userId });
    const wallet= await Wallet.find({ userId: userId });
    const categories  =await Category.find()
    const cartData = await Cart.findOne({ userId: req.session.user_id }).populate({
      path: 'items.productId',
      model: 'Product', // Reference to your product model
    });
  
    res.render('profile', { addresses,categories,username: userData.username,userData,wishlist,wallet, cartData   });
  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};

// Display the form for adding a new address
const addAddressForm = (req, res) => {
  res.render('addAddressForm'); // Render the form for adding a new address
};

// Add a new address to the user's profile
const addAddress = async (req, res) => {
  try {
    const userId = req.session.user_id; // Assuming userId is stored in the session after authentication
    // Retrieve address details from the form
    const { country, state, district,houseNO,  cityOrVillage, street, pin } = req.body;
    const addressData={ country:country,
      state: state,
      houseNO:houseNO,
      district: district,
      cityOrVillage:cityOrVillage,
      street:street,
      pin:pin,
      selected:false
    }
  const existingdAddress =await Address.findOne({userId:userId});
  if(!existingdAddress ){


    // Create a new address document
    const newAddress = new Address({
      userAddress:addressData,
      userId:userId,
      
    });

    // Save the new address to the database
    await newAddress.save();
  }else{
    await Address.findOneAndUpdate({userId:userId},
      {
        $push:{userAddress:addressData},
  }
  )}
    // Redirect back to the user's address list
    res.redirect('/profile/addresses');
  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};



// Edit an existing address
const editAddress = async (req, res) => {
  try {
    const userId = req.session.user_id; // Assuming userId is stored in the session after authentication
    const addressId = req.params.addressId;

    // Retrieve updated address details from the form
    const { country, state, district, houseNO, cityOrVillage, street, pin } = req.body;

    // Find the user's address by userId and the specific address by _id
    const userAddress = await Address.findOne({ userId });
    const addressToEdit = userAddress.userAddress.find(address => address._id.toString() === addressId);

    // Update the fields
    addressToEdit.country = country;
    addressToEdit.state = state;
    addressToEdit.district = district;
    addressToEdit.houseNO = houseNO;
    addressToEdit.cityOrVillage = cityOrVillage;
    addressToEdit.street = street;
    addressToEdit.pin = pin;

    // Save the updated document
    await userAddress.save();

    // Redirect back to the user's address list
    res.redirect('/profile/addresses');
  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};

// Delete an address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.session.user_id; // Assuming userId is stored in the session after authentication
    const addressId = req.params.addressId;

    // Find the user's address by userId
    const userAddress = await Address.findOne({ userId });

    // Remove the specific address by _id
    userAddress.userAddress = userAddress.userAddress.filter(address => address._id.toString() !== addressId);

    // Save the updated document
    await userAddress.save();

    // Redirect back to the user's address list
    res.redirect('/profile/addresses');
  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};

const userProfile =(req,res) =>{

    res.render('profile',);
}

const selectAddressForOrder = async (req, res) => {
  const addressId = req.params.addressId;
  const userId = req.session.user_id;
  
  try {
    // Find the address with the provided ID
    const userAddress = await Address.findOne({ userId });
    
    if (!userAddress) {
     const message = 'User Address not found' 
      return  res.render('adminSweetAlert.ejs', { message });
       
    }

    // Loop through the userAddress array and set selected to false for all addresses
    userAddress.userAddress.forEach(address => {
     const selectedAddress =address._id.toString() === addressId
      if (address._id.toString() === addressId) {
    
        address.selected = true; // Set selected to true for the selected address
      } else {
        address.selected = false; // Set selected to false for other addresses
      }
    });
    // Save the updated userAddress document
    await userAddress.save();
    message= ' this address is selected for this payment'
    return res.render('userSweetAlert.ejs', { message }); 


  } catch (error) {
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
}


module.exports = {
  getUserAddresses,
  addAddressForm,
  addAddress,
 
  editAddress,
  deleteAddress,
  userProfile,
  selectAddressForOrder
};
