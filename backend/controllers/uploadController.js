const db = require('../database');
const upload = require('../cloudinaryUpload'); // multer s Cloudinary
const cloudinary = require('../cloudinary');   // import cloudinary konfigurácie

// Nahranie profilovej fotky
exports.uploadProfilePhoto = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });

  try {
    // 1️⃣ Zisti starý public_id
    const [rows] = await db.query('SELECT user_photo_public_id FROM user WHERE id = ?', [userId]);
    const oldPublicId = rows[0]?.user_photo_public_id;

    // 2️⃣ Vymaž starý obrázok, ak existuje a nie je default
    if (oldPublicId && !oldPublicId.includes('default-avatar')) {
      await cloudinary.uploader.destroy(oldPublicId);
      console.log('Starý obrázok vymazaný z Cloudinary:', oldPublicId);
    }

    // 3️⃣ Spusti upload cez multer
    upload.single('photo')(req, res, async function (err) {
      if (err) return res.status(400).json({ success: false, message: err.message });
      if (!req.file || !req.file.path) return res.status(400).json({ success: false, message: 'Súbor nebol odoslaný.' });

      const cloudinaryUrl = req.file.path;
      const publicId = req.file.filename || req.file.public_id;

      // 4️⃣ Ulož nový obrázok do DB
      await db.query('UPDATE user SET user_photo = ?, user_photo_public_id = ? WHERE id = ?', [cloudinaryUrl, publicId, userId]);

      console.log('Nová fotka nahraná na Cloudinary:', cloudinaryUrl);
      return res.json({ success: true, photo: cloudinaryUrl });
    });

  } catch (error) {
    console.error('Chyba pri uploadovaní fotky:', error);
    return res.status(500).json({ success: false, message: 'Chyba pri uploadovaní fotky.' });
  }
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
