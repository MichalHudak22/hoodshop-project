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

    const cloudinaryUrl = req.file.path;  // Cloudinary URL
    const publicId = req.file.filename;   // Cloudinary public_id

    try {
      // 1️⃣ Zisti predchádzajúci public_id, aby sme ho vymazali
      const [rows] = await db.query('SELECT user_photo_public_id FROM user WHERE id = ?', [userId]);
      const oldPublicId = rows[0]?.user_photo_public_id;

      if (oldPublicId) {
        // Nevymaž default avatar
        if (!oldPublicId.includes('default-avatar')) {
          await cloudinary.uploader.destroy(oldPublicId);
          console.log('Predchádzajúci obrázok vymazaný z Cloudinary:', oldPublicId);
        }
      }

      // 2️⃣ Ulož nový obrázok + public_id
      await db.query(
        'UPDATE user SET user_photo = ?, user_photo_public_id = ? WHERE id = ?',
        [cloudinaryUrl, publicId, userId]
      );

      console.log('Fotka nahraná na Cloudinary:', cloudinaryUrl);
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
    // Pred zmenou na default vymaž predchádzajúci obrázok, ak nebol default
    const [rows] = await db.query('SELECT user_photo_public_id FROM user WHERE id = ?', [userId]);
    const oldPublicId = rows[0]?.user_photo_public_id;

    if (oldPublicId && !oldPublicId.includes('default-avatar')) {
      await cloudinary.uploader.destroy(oldPublicId);
      console.log('Predchádzajúci obrázok vymazaný z Cloudinary:', oldPublicId);
    }

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
