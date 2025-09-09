const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary'); // tvoj cloudinary config

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_photos', // priečinok na Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
});

const upload = multer({ storage });

module.exports = upload;
