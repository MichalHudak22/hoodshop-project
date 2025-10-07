// uploadAvatar.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary'); // import konfigurácie Cloudinary

// Multer storage pre avatary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_photos', // priečinok pre avatary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
});

// Nahrávanie jedného súboru s poľom 'photo' (frontend musí používať rovnaké meno poľa)
const uploadAvatar = multer({ storage }).single('photo');

module.exports = uploadAvatar;
