const db = require('../database');
const upload = require('../middleware/upload'); // tvoj multer s Cloudinary

// Nahranie profilovej fotky
exports.uploadProfilePhoto = (req, res) => {
  console.log('User ID:', req.userId);

  upload(req, res, async function (err) {
    if (err) {
      console.error('Multer/Cloudinary error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });

    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: 'Súbor nebol odoslaný.' });
    }

    const cloudinaryUrl = req.file.path; // URL obrázka z Cloudinary

    try {
      // 💾 Ulož cestu do databázy
      await db.query('UPDATE user SET user_photo = ? WHERE id = ?', [cloudinaryUrl, userId]);

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
  if (!userId) return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });

  const defaultUrl = 'https://res.cloudinary.com/dd8gjvv80/image/upload/v1690000000/profile_photos/default-avatar.jpg'; // zmeň podľa svojej defaultnej fotky v Cloudinary

  try {
    await db.query('UPDATE user SET user_photo = ? WHERE id = ?', [defaultUrl, userId]);

    return res.json({ success: true, photo: defaultUrl });
  } catch (error) {
    console.error('Chyba pri nastavovaní defaultnej fotky:', error);
    return res.status(500).json({ success: false, message: 'Chyba pri nastavovaní defaultnej fotky.' });
  }
};
