const Category = require('../models/category');
const Product = require('../models/product');
const User = require('../models/user');
const Wishlist = require('../models/wishlist');
const Cart = require('../models/cart');
const Banner = require('../models/banner');

// Add a new category
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const adminId = req.session.admin_id;

    if (!adminId) {
      const message = "Admin not authenticated.";
      return res.render('adminSweetAlert.ejs', { message });
    }

    // Check if a category with the same name already exists
    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      // If the category already exists, display a SweetAlert
      const message = "Category with the same name already exists.";
      return res.render('adminSweetAlert.ejs', { message });
    }

    const newCategory = new Category({ name });
    await newCategory.save();

    const message = 'Category saved';
    return res.render('AdminSweetAlert.ejs', { message });
  } catch (error) {
    console.error(error);
    return res.status(500).render('error', { error, status: 500 });
  }
};


// Edit an existing category
const editCategory = async (req, res) => {
  try {
    const  adminId =req.session.admin_id
    if (!adminId) {
        const message = "admin not authenticated.";
       return  res.render('adminSweetAlert.ejs', { message });
      }
    const { categoryId } = req.params;
    const { name } = req.body;

    await Category.findByIdAndUpdate(categoryId, { name });

    res.redirect('/admin');
  } catch (error) {
    console.error(err);
    return  res.status(500).render('error', { error, status: 500 });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
 
  try {
    const { categoryId } = req.params;
    const  adminId =req.session.admin_id
    if (!adminId) {
        const message = "admin not authenticated.";
       return  res.render('adminSweetAlert.ejs', { message });
      }
    await Category.findByIdAndRemove(categoryId);
    
    message ='Category deleted successfully.'
    return res.render('AdminSweetAlert.ejs', { message });

  } catch (error) {
  
    console.error(error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};


category_products = async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
    
      const category = await Category.findById(categoryId).populate('products');
      const cartData = await Cart.findOne({ userId: req.session.user_id }).populate({
        path: 'items.productId',
        model: 'Product', // Reference to your product model
      });
      
      res.render('category_products', { category,
        cartData});
    } catch (error) {
      console.error(error);
      return  res.status(500).render('error', { error, status: 500 });
    }
  }
// filtering
  const loadHomeWichCategoryFilter = async (req, res) => {
    try {
     
      const wishlist  =await Wishlist.findOne({userId:req.session.user_id })
      const  {categoryId } = req.params 
      const categories  =await Category.find()
      const products = await Product.find({ 'category': categoryId });
      const cartData = await Cart.findOne({ userId: req.session.user_id }).populate({
        path: 'items.productId',
        model: 'Product', // Reference to your product model
      });
      const banners = await Banner.find({ isActive: true });
      
    res.render('homepage', { username: null,products,categories,wishlist,cartData,banners   });
     
    } catch (error) {
      console.log(error)
        return  res.status(500).render('error', { error, status: 500 });
    }
};


module.exports = {
 
    addCategory ,
    editCategory ,
    deleteCategory,
    loadHomeWichCategoryFilter
 
}