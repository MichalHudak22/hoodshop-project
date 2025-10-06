const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products', // zmena z 'profile_photos' na 'products'
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
});

// Zmena názvu poľa na 'image', aby sedelo s frontendom
const uploadSingle = multer({ storage }).single('image');

module.exports = uploadSingle;
