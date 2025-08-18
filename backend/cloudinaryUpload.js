const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary'); // ⬅️ tu použi config, nie balík

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_photos', // priečinok v Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // voliteľné
  },
});

const upload = multer({ storage });

module.exports = upload;
