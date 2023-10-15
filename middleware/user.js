const User = require('../models/user');


const isLogOut=async(req,res,next)=>{
    try {
        if(req.session.user_id ) 
        {
            res.redirect('/')
        }
        else{
            next()
        }
    } catch (error) {
        console.log(error)
    }
}
const checkUserStatus = async (req, res, next) => {
    try {
      if (req.session.user_id) {
        const userData = await User.findById({ _id: req.session.user_id });
  
        let isUserBlocked = userData.isBlocked;
        if (isUserBlocked === true) {
          // Set a message in the session
          req.session.blockedMessage = 'You are blocked by admin';
          // Destroy the session
          req.session.destroy(() => {
            // Redirect to the login page
            res.redirect('/login');
          });
        } else {
          next();
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  };
  

const isLogin=async(req,res,next)=>{
    try {
        if(req.session.user_id){
            next()
        }
        else{
            res.redirect('/')
           
        }
    
    } catch (error) {
        console.log(error)
    }
}
const otp= async(req,res,next)=>{
  try{
    if(req.body.otp){
      next()
    }else{
      res.redirect('/login');

    }
  }catch(error){
    console.log(error)
  }
}
module.exports={
    isLogin,
    isLogOut,
    checkUserStatus ,
    otp
}