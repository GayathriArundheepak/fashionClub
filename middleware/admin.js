const isLogOut=async(req,res,next)=>{
   
    try {
        if(req.session.admin_id)
        {
        
            res.redirect('/admin/home')
        }
        else{
        
            next()
        }
    } catch (error) {
        console.log(error)
    }
}
const isLogin=async(req,res,next)=>{

    try {
        if(req.session.admin_id){
        
            next()
        }
        else{
            res.redirect('/admin')
            sweat_alert="signIn"
        }
   
    } catch (error) {
        console.log(error)
    }
}

const otp = async(req,res,next)=>{
    
    try {
        if(req.session.admin_id)
        {
        
            res.redirect('/admin/home')
        }
        else{
          
                 next()
       
        }

}catch  (error) {
    
        console.log(error)
}
}
module.exports={
    isLogin,
    isLogOut,
    otp
}