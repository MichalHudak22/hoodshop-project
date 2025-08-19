// controllers/uploadController.js
const db = require('../database');
const upload = require('../cloudinaryUpload');
const cloudinary = require('../cloudinary');

// Nahranie profilovej fotky
exports.uploadProfilePhoto = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });

  try {
    // 1️⃣ Zisti starý public_id
    const [rows] = await db.query('SELECT user_photo_public_id FROM user WHERE id = ?', [userId]);
    const oldPublicId = rows[0]?.user_photo_public_id;

    // 2️⃣ Najprv zmaž starý avatar (ak existuje)
    if (oldPublicId && !oldPublicId.includes('default-avatar')) {
      try {
        // 🟢 Debug log
        console.log("Mazem z Cloudinary:", oldPublicId);

        // 🟢 Skús overiť, či existuje
        try {
          const info = await cloudinary.api.resource(oldPublicId);
          console.log("Obrázok existuje:", info.secure_url);
        } catch (err) {
          console.error("❌ Obrázok sa nenašiel:", err.message);
        }

        // 🟢 Skús vymazať
        const result = await cloudinary.uploader.destroy(oldPublicId);
        console.log("Destroy Cloudinary response:", result);
      } catch (err) {
        console.error("❌ Chyba pri mazaní obrázka:", err);
      }
    }

    // 3️⃣ Potom uploadni nový
    upload.single('photo')(req, res, async function (err) {
      if (err) return res.status(400).json({ success: false, message: err.message });
      if (!req.file || !req.file.path || !req.file.filename) {
        return res.status(400).json({ success: false, message: 'Súbor nebol odoslaný.' });
      }

      // 🟢 Debug log
      console.log("req.file:", req.file);

      const cloudinaryUrl = req.file.path;
      const publicId = req.file.filename;

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
