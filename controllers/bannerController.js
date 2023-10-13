const Banner = require('../models/banner');
const sharp = require('sharp');

const bannerUploadPage =async (req,res)=>{
    try{

const banners = await Banner.find();
        res.render('bannerUpload',{banner:banners})
    }catch(error){
        console.error(error.message);
        return res.status(500).render('error', { error, status: 500 });
    }
}
const uploadBanner = async (req, res) => {
    try {
        // Check if new images are provided in the request
        if (req.files && req.files.length > 0) {
            const uploadedImages = req.files;
            const bannerImageURLs = []; // Array to store banner image URLs
            const width = parseInt(req.query.width) || 550; // Default width
            const height = parseInt(req.query.height) || 550; // Default height
            // Process each uploaded image
            for (const image of uploadedImages) {
                await sharp(image.path)
                .resize(width, height, { fit: 'cover' }) // Crop to the specified dimensions
                    .toFile(`public/uploads/banner_${image.filename}`); // Save the processed image

                bannerImageURLs.push(`/uploads/banner_${image.filename}`);
            }

            // Create a new Banner document with values from req.body
            const newBanner = new Banner({
                title: req.body.title,
                imageUrl: bannerImageURLs, // Store the banner image URLs
                description: req.body.description,
                buttonText: req.body.buttonText,
                buttonLink: req.body.buttonLink,
                isActive: true, // You can set this value as needed
            });
            await newBanner.save();


            const message = "Banner added.";
            return res.render('adminSweetAlert.ejs', { message });
            
        } else {
            // Handle the case where no new images were provided
            const message = "Please provide at least one banner image.";
            return res.render('adminSweetAlert.ejs', { message });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).render('error', { error, status: 500 });
    }
};

const editBanner = async (req, res) => {
    try {
        const bannerId = req.params.id; // Assuming you have the banner's ID in the URL

        // Check if new images are provided in the request
        if (req.files && req.files.length > 0) {
            const uploadedImages = req.files;
            const bannerImageURLs = [];
            const width = parseInt(req.query.width) || 550; // Default width
            const height = parseInt(req.query.height) || 550; // Default height
            // Process each uploaded image
            for (const image of uploadedImages) {
                await sharp(image.path)
                .resize(width, height, { fit: 'cover' }) // Crop to the specified dimensions
                    .toFile(`public/uploads/banner_${image.filename}`); // Save the processed image

                bannerImageURLs.push(`/uploads/banner_${image.filename}`);
            }

            // Find the existing banner by ID and update its fields
            const updatedBanner = await Banner.findOneAndUpdate(
                { _id: bannerId }, // Find by ID
                {
                    title: req.body.title,
                    imageUrl: bannerImageURLs, // Update the banner image URLs
                    description: req.body.description,
                    buttonText: req.body.buttonText,
                    buttonLink: req.body.buttonLink,
                    isActive: true, // You can set this value as needed
                },
                { new: true } // Return the updated document
            );

            if (updatedBanner) {
                const message = "Banner updated.";
                return res.render('adminSweetAlert.ejs', { message });
            } else {
                // Handle the case where the banner with the provided ID was not found
                const message = "Banner not found.";
                return res.render('adminSweetAlert.ejs', { message });
            }
        } else {
            // Handle the case where no new images were provided
            const message = "Please provide at least one banner image.";
            return res.render('adminSweetAlert.ejs', { message });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).render('error', { error, status: 500 });
    }
};

module.exports ={
    bannerUploadPage,
    uploadBanner,
    editBanner

}