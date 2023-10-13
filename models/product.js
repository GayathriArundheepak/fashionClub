const mongoose=require("mongoose")


const ProductSchema =new mongoose.Schema(
    {
        title:{type:String, required:true,unique:true},
        desc:{type:String, require:true},
        // images: [
        //   {
        //     data: Buffer,
        //     contentType: String,
        //   },
        // ],
        images:[{
          type: String 
        }],
        adminProductImage:[{type: String}],
        // sizes: [
        //   {
        //     size: { type: String, required: true },
        //     stock: { type: Number, default: 0, required: true },
        //   },
        // ],
      
        size: [{ type: String }],
        // color:{type:String},
        price:{type:String, require:true},

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category', // Reference to your category model
            required: true,
       
            },
            // subcategory: {
            //     type: mongoose.Schema.Types.ObjectId,
            //     ref: 'Subcategory', // Reference to the Subcategory model
            //     required: true,
            //   },
              stocks: {
                type: Number,
                default: 0,
                require:true
              },
              userCanVisible:{
                type:Boolean,
                default:true,
                require:true

              }

              
              
    },{timestamps:true}
)

module.exports=mongoose.model("Product",ProductSchema);
