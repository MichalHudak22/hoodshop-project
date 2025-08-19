const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const userId = req.userId;
    if (!userId) throw new Error('Neautorizovaný prístup.');

    // Použijeme vždy rovnaký public_id
    const publicId = `profile_photos/user_${userId}`;

    return {
      public_id: publicId,           // ❗ dôležité
      folder: 'profile_photos',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
      overwrite: true,               // ❗ prepíše existujúci súbor
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
