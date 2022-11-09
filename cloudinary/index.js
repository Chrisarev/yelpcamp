const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET
}); ///configures cloudinary to our cloudinary account

const storage = new CloudinaryStorage({
    cloudinary, 
    params: {
        folder: 'YelpCamp', 
        allowedFormats:['jpeg', 'png', 'jpg']
    }
}); ///specifies which folder in cloudinary to upload images to, and accepted image
    ///formats 

module.exports={
    cloudinary, 
    storage
}