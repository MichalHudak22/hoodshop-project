const db = require('../database');
const upload = require('../cloudinaryUpload'); // multer s Cloudinary
const cloudinary = require('../cloudinary');   // import cloudinary konfigurácie

// Nahranie profilovej fotky
exports.uploadProfilePhoto = (req, res) => {
  console.log('User ID:', req.userId);

  upload.single('photo')(req, res, async function (err) {
    if (err) {
      console.error('Multer/Cloudinary error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: 'Súbor nebol odoslaný.' });
    }

    const cloudinaryUrl = req.file.path;          // Cloudinary URL (https://...)
    const publicId = req.file.filename || req.file.public_id;   // správny public_id

    try {
      // 1️⃣ Nájdeme starý public_id
      const [rows] = await db.query(
        'SELECT user_photo_public_id FROM user WHERE id = ?',
        [userId]
      );
      const oldPublicId = rows[0]?.user_photo_public_id;

      // 2️⃣ Vymažeme starý obrázok, ak existuje a nie je to default
      if (oldPublicId && !oldPublicId.includes('default-avatar')) {
        await cloudinary.uploader.destroy(oldPublicId);
        console.log('Predchádzajúci obrázok vymazaný z Cloudinary:', oldPublicId);
      }

      // 3️⃣ Uložíme novú URL + public_id
      await db.query(
        'UPDATE user SET user_photo = ?, user_photo_public_id = ? WHERE id = ?',
        [cloudinaryUrl, publicId, userId]
      );

      console.log('Nová fotka nahraná na Cloudinary:', cloudinaryUrl);
      return res.json({ success: true, photo: cloudinaryUrl });

    } catch (error) {
      console.error('Chyba pri ukladaní obrázka do databázy:', error);
      return res.status(500).json({ success: false, message: 'Chyba pri ukladaní do databázy.' });
    }
  });
};

// Nastavenie defaultnej profilovej fotky
exports.setDefaultProfilePhoto = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });
  }

  const defaultUrl = 'https://res.cloudinary.com/dd8gjvv80/image/upload/v1690000000/profile_photos/default-avatar.jpg';

  try {
    // Zistíme starý obrázok a vymažeme ho (ak nebol default)
    const [rows] = await db.query(
      'SELECT user_photo_public_id FROM user WHERE id = ?',
      [userId]
    );
    const oldPublicId = rows[0]?.user_photo_public_id;

    if (oldPublicId && !oldPublicId.includes('default-avatar')) {
      await cloudinary.uploader.destroy(oldPublicId);
      console.log('Predchádzajúci obrázok vymazaný z Cloudinary:', oldPublicId);
    }

    // Nastavíme default URL a null public_id
    await db.query(
      'UPDATE user SET user_photo = ?, user_photo_public_id = NULL WHERE id = ?',
      [defaultUrl, userId]
    );

    return res.json({ success: true, photo: defaultUrl });

  } catch (error) {
    console.error('Chyba pri nastavovaní defaultnej fotky:', error);
    return res.status(500).json({ success: false, message: 'Chyba pri nastavovaní defaultnej fotky.' });
  }
};
