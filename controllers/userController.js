const bcrypt = require('bcrypt');
const Wishlist = require('../models/wishlist');
const User = require('../models/user');
const Product = require('../models/product');
const  Category = require('../models/category');
const Cart = require('../models/cart');
const Banner = require('../models/banner');

  




let message=null;
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        return  res.status(500).render('error', { error, status: 500 });
       
    }
};

const loadRegister = async (req, res) => {
    try {
        res.render('register', { message });
        message = null;
    } catch (error) {
        return  res.status(500).render('error', { error, status: 500 });
    }
};

const insertUser = async (req, res) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const phoneNumber = req.body.phoneNumber;
        const password = req.body.password;

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            message = "User already exists";
            return res.render('register', { message });
        }

        const hashedPassword = await securePassword(password);

        const newUser = new User({
            username,
            email,
            phoneNumber ,
            password: hashedPassword,
            isAdmin: false
        });

        
        await newUser.save();
                res.redirect('/admin/generate-otp');
            } catch (error) {
        return  res.status(500).render('error', { error, status: 500 });
    }
};


const loginLoad = async (req, res) => {
    try {
        if (req.session.user_id ) {
            res.redirect('/');
        } else {
            res.render('login', { message });
        }
    } catch (error) {
        return  res.status(500).render('error', { error, status: 500 });
    }
};

const verifyLogin = async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const userData = await User.findOne({ username });
        

        if (!userData) {
            message = "Username is incorrect";
            return res.render('login', { message });
        }

        const passwordMatch = await bcrypt.compare(password, userData.password);

        if (!passwordMatch) {
            message = "Incorrect password";
            return res.render('login', { message });
        }

        if (userData.isBlocked) {
            message = "Account is blocked, Please contact for reason  and support.";
            return res.render('userSweetAlert.ejs', { message });
        }
         // Update the user's isLoggedIn field to true.
    await User.updateOne( { _id: userData._id },{ $set: { isLoggedIn:true} } );
        
        req.session.user_id = userData._id;


    
          const userId = userData._id; // Assuming your user model has an '_id' field
      
            res.redirect("/");
    } catch (error) {
        return  res.status(500).render('error', { error, status: 500 });
    }
};

const loadHome = async (req, res) => {
    try {
       
        const categories  =await Category.find()
        const wishlist  =await Wishlist.findOne({userId:req.session.user_id })
        const cartData = await Cart.findOne({ userId: req.session.user_id }).populate({
            path: 'items.productId',
            model: 'Product', // Reference to your product model
          });
          const banners = await Banner.find({ isActive: true });
          const page = parseInt(req.query.page) || 1; // Get the requested page number
          const perPage = 8; // Number of items to display per page
  
          const products = await Product.find()
          .skip((page - 1) * perPage)
          .limit(perPage);
                  
        const totalItems = await Product.countDocuments();
        const totalPages = Math.ceil(totalItems / perPage);
        if (req.session.user_id ) {
          
            const userData = await User.findOne({ _id: req.session.user_id }, { username: 1 });
        
             
                
            res.render('homepage', { username: userData.username,userData,products,categories,wishlist,cartData,banners,page,totalPages   });
        } else {
            
                      res.render('homepage', { username: null,products,categories,wishlist:null,cartData:null,banners,page,totalPages    });
    
        }
    } catch (error) {
        return  res.status(500).render('error', { error, status: 500 });
    }
};


const userLogout = async (req, res) => {
    try {
        req.session.user_id = null;
    
                 // Update the user's isLoggedIn field to true.
    // await User.updateOne( { _id: userData._id },{ $set: { isLoggedIn:false} } );
        res.clearCookie('user_id');
        res.redirect('/login');

    } catch (error) {
        console.log(error.message);
        return  res.status(500).render('error', { error, status: 500 });
    }
};
const resetPasswordPage= async (req,res)=>{
    
    return res.render("forgotPassword")
}


const resetPassword = async (req, res) => {
    const { username, newPassword } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ username });
  
      if (!user) {
        const   message= "User not found" 
        return  res.render('userSweetAlert.ejs', { message });
       
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password in the database
      user.password = hashedPassword;
      await user.save();
    //   res.redirect("/generate-otp?query=value");

      res.redirect("/generate-otp")
    } catch (error) {
      console.error(error);
      return res.status(500).render('error', { error, status: 500});
    }
  }



  const userUpdate =async (req,res)=>{
    const userId = req.session.user_id;
    const wishlist = await Wishlist.findOne()
    const cartData = await Cart.findOne({userId:userId} )
    try {
    const user = await User.findById(userId);
    res.render("selfUpdateUser", { user,wishlist,cartData  });
    }catch (error) {
        console.log(error)
        return  res.status(500).render('error', { error, status: 500 });
    }
  }

  const selfUpdateUser = async (req, res) => {
    const userId = req.session.user_id;
   
    const { username, email, phoneNumber} = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
          const   message= "User not found" 
            return res.render('userSweetAlert.ejs', { message }); 
        }
    

  
        // const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update the user's data in the database
        user.username = username;
        user.email = email;
        user.phoneNumber = phoneNumber;
        // user.password = hashedPassword;
        
        // Save the updated user
        await user.save();

        res.redirect("/profile/addresses");
    } catch (error) {
        console.error(error);
        return  res.status(500).render('error', { error, status: 500 });
    }
}


module.exports = {
    loadRegister,
    insertUser,
    resetPasswordPage ,
    resetPassword ,
    loginLoad,
    verifyLogin,
    loadHome,
    userUpdate,
    selfUpdateUser ,
    userLogout,
    
};
