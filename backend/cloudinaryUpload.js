const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary'); // cesta k tvojmu cloudinary.js

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_photos',  // priečinok v Cloudinary, kam sa budú ukladať fotky
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // voliteľné zmenšenie
  },
});

const upload = multer({ storage });

module.exports = upload;
