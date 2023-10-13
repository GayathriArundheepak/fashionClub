const mongoose=require("mongoose")


const UserSchema =new mongoose.Schema(
    {
        username:{type:String, required:true,unique:true},
        email:{type:String, require:true,unique:true},
        phoneNumber:{type:Number, require:true,unique:true},
        password:{type:String, require:true},
        isadmin:{
            type:Boolean,
            default:false,
        },
        isBlocked: { type: Boolean, default: false },
        blockedReason: {type:String},
        isLoggedIn :{
          type:Boolean,
          default:false,

        },

    },{timestamps:true}
)




module.exports=mongoose.model("user",UserSchema);

