const User = require('../models/user');
const bcrypt = require('bcrypt');
const Product = require('../models/product');
const Category= require('../models/category');


let message= null;
const loadLogin = async (req, res) => {
    try {
        if (req.session.admin_id) {
   
           
           
            return res.redirect('/home');
        }
        res.render('adminlogin', { message });
        message = null;
    } catch (error) {
        console.log(error.message);
        return  res.status(500).render('error', { error, status: 500 });
    }
};





const adminDashboard = async (req, res) => {
    try {
      
            const page = parseInt(req.query.page) || 1; // Get the requested page number
            const perPage = 5; // Number of items to display per page
      const products = await Product.find()
      .skip((page - 1) * perPage)
      .limit(perPage);
    if (req.session.admin_id) {
      const admin = await User.findById({ _id: req.session.admin_id });
      // Fetch the category data here
      const categories = await Category.find();

      let adminName = admin.username;
    const totalItems = await Product.countDocuments();
    const totalPages = Math.ceil(totalItems / perPage);


      
      // Pass the category data to the view
      return res.render('adminhome', { adminName, products, categories,  page,
        totalPages, });
    }

  
    res.redirect("/adminlogin")
    message = null;
  } catch (error) {
    console.log(error.message);
   
    return  res.status(500).render('error', { error, status: 500 });
  }
};




const verify = async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const page = parseInt(req.query.page) || 1; // Get the requested page number
        const perPage = 5; // Number of items to display per page

        const products = await Product.find()
        .skip((page - 1) * perPage)
        .limit(perPage);
                
      const totalItems = await Product.countDocuments();
      const totalPages = Math.ceil(totalItems / perPage);
   
        const userdata = await User.findOne({ username });
        // console.log(userdata)
        if (!userdata) {
            message = `username ${username } not found`;
            
            return res.render('adminSweetAlert', { message });
        }

        if (!userdata.isadmin) {
            message = "You are not an admin";
            return res.render('adminSweetAlert', { message });
        }

        const passwordMatch = await bcrypt.compare(password, userdata.password);

        if (!passwordMatch) {
            message = "Incorrect password";
            return res.render('adminSweetAlert', { message });
        }

        req.session.admin_id = userdata._id;
        // console.log( req.session.admin_id)
       

        // Fetch the category data here
        const categories = await Category.find();
     
        let adminName =null;

       
  
        res.render('adminhome', { adminName: userdata.username, products,categories,page,
            totalPages,});
  
    } catch (error) {
        console.log(error.message);
        return  res.status(500).render('error', { error, status: 500 });
       
    }
};

// Define other functions like searchUser, updateUser, blockUser

const adminLogout = async (req, res) => {
    try {
        req.session.admin_id = null;

        res.render('adminlogin',{message:"you are logout"});
    } catch (error) {
        console.log(error.message);
        return  res.status(500).render('error', { error, status: 500 });
    }
};


// Function to render the user list page
const userTable = async (req, res) => {
    try {
     const  adminId =req.session.admin_id
     const page = parseInt(req.query.page) || 1; // Get the requested page number
     const perPage = 5; // Number of items to display per page
 
    
             
   const totalItems = await User.countDocuments();
   const totalPages = Math.ceil(totalItems / perPage);
    if (!adminId) {
        const message = "admin not authenticated.";
       return  res.render('adminSweetAlert.ejs', { message });
      }
        // Fetch user details from the database
        const userDetails = await User.find()
                                      .sort('-createdAt')
                                      .skip((page - 1) * perPage)
                                      .limit(perPage);
        res.render('user', { user: userDetails,page ,totalPages});
    } catch (error) {
        console.error(error.message);
        return  res.status(500).render('error', { error, status: 500 });
    }
};



const searchUser = async (req, res) => {
     try {
        const { query } = req.query;
        const  adminId =req.session.admin_id
        if (!adminId) {
            const message = "admin not authenticated.";
           return  res.render('adminSweetAlert.ejs', { message });
          }
      
      
        const searchResults = await User.find({
            $or: [
            
                {username: { $regex: new RegExp(query, 'i') } },
                { email: { $regex: `${query}`, $options: 'i' } },
              
            ],
        });

     

    
        console.log(searchResults )

        res.render('searchUsers', { searchResults }); // Pass the search results to the template
    } catch (error) {
        console.error(error);
        return  res.status(500).render('error', { error, status: 500 });
    }
};

const searchProducts = async (req, res) => {
     try {
        const  adminId =req.session.admin_id
        const page = parseInt(req.query.page) || 1; // Get the requested page number
        const perPage = 5; // Number of items to display per page
  const products = await Product.find()
                                .skip((page - 1) * perPage)
                                .limit(perPage);
  const totalItems = await User.countDocuments();
  const totalPages = Math.ceil(totalItems / perPage);
        if (!adminId) {
            const message = "admin not authenticated.";
           return  res.render('adminSweetAlert.ejs', { message });
          }
        const { query } = req.query;
  
        const searchResults = await Product.find({
            $or: [
                {  title:  { $regex: new RegExp(query, 'i') }  },
                {  price: { $regex: `${query}`, $options: 'i' } },
              
            ],
        });

    
 

        res.render("product-list",{products: searchResults, page,
            totalPages, }); // Pass the search results to the template
    } catch (error) {
        console.error(error);
        return  res.status(500).render('error', { error, status: 500 });
    }
};


const updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const  adminId =req.session.admin_id
    if (!adminId) {
        const message = "admin not authenticated.";
       return  res.render('adminSweetAlert.ejs', { message });
      }
        const user = await User.findById(userId);
        res.render('user-update', { user });
    } catch (error) {
        console.log(error.message);
        return  res.status(500).render('error', { error, status: 500 });
    }
};

const blockUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const reason = req.body.reason;
        const  adminId =req.session.admin_id
        if (!adminId) {
            const message = "admin not authenticated.";
           return  res.render('adminSweetAlert.ejs', { message });
          }
        const user = await User.findByIdAndUpdate(userId, {
            isBlocked: true,
            blockedReason: reason
        });
     const   message= 'User blocked successfully' 
        return res.render('adminSweetAlert.ejs', { message });
        

    } catch (error) {
        console.log(error.message);
        return  res.status(500).render('error', { error, status: 500 });
    }
};

// Unblock user function
const unblockUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const reason = req.body.reason;
        const  adminId =req.session.admin_id
        if (!adminId) {
            const message = "admin not authenticated.";
           return  res.render('adminSweetAlert.ejs', { message });
          }
        const user = await User.findByIdAndUpdate(userId, {
            isBlocked:false,
            blockedReason: reason
        });
     const    message= 'User unblocked successfully' 
         return res.render('adminSweetAlert.ejs', { message });
       
    
    } catch (error) {
        console.log(error.message);
        return  res.status(500).render('error', { error, status: 500 });
    }


};

module.exports = {
    loadLogin,
    adminLogout,
    adminDashboard,
    verify,
    userTable,
    updateUser,
    searchUser,
    searchProducts,
    blockUser,
    unblockUser 
};

