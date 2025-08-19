// controllers/uploadController.js
const db = require('../database');
const upload = require('../cloudinaryUpload');
const cloudinary = require('../cloudinary');

// Nahratie profilovej fotky
exports.uploadProfilePhoto = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });

  try {
    // 1️⃣ Zisti starý public_id
    const [rows] = await db.query('SELECT user_photo_public_id FROM user WHERE id = ?', [userId]);
    const oldPublicId = rows[0]?.user_photo_public_id;

    // 2️⃣ Uploadni nový obrázok
    upload.single('photo')(req, res, async function (err) {
      if (err) return res.status(400).json({ success: false, message: err.message });
      if (!req.file || !req.file.path || !req.file.filename) {
        return res.status(400).json({ success: false, message: 'Súbor nebol odoslaný.' });
      }

      const cloudinaryUrl = req.file.path;
      const publicId = req.file.filename;

      // 3️⃣ Zmaž starý obrázok (ak existuje a nie je default)
      if (oldPublicId && !oldPublicId.includes('default-avatar')) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
          console.log("Starý obrázok zmazaný:", oldPublicId);
        } catch (err) {
          console.error("Chyba pri mazaní starého obrázka:", err);
        }
      }

      // 4️⃣ Ulož nový do DB
      await db.query(
        'UPDATE user SET user_photo = ?, user_photo_public_id = ? WHERE id = ?',
        [cloudinaryUrl, publicId, userId]
      );

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
