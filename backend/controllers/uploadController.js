const db = require('../database');
const upload = require('../cloudinaryUpload');
const cloudinary = require('../cloudinary');
const util = require('util');

// Promisify multer
const uploadAsync = util.promisify(upload.single('photo'));

exports.uploadProfilePhoto = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });

  try {
    // Zisti starý public_id
    const [rows] = await db.query('SELECT user_photo_public_id FROM user WHERE id = ?', [userId]);
    const oldPublicId = rows[0]?.user_photo_public_id;

    // Použijeme multer upload
    await uploadAsync(req, res);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Súbor nebol odoslaný.' });
    }

    const cloudinaryUrl = req.file.path;     // celá URL pre zobrazenie
    const publicId = req.file.filename;      // správny public_id pre mazanie

    // Zmaž starý obrázok až po upload
    if (oldPublicId && !oldPublicId.includes('default-avatar')) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (err) {
        console.error("Chyba pri mazaní starého obrázka:", err.message);
      }
    }

    // Ulož nový do DB
    try {
      await db.query(
        'UPDATE user SET user_photo = ?, user_photo_public_id = ? WHERE id = ?',
        [cloudinaryUrl, publicId, userId]
      );
    } catch (err) {
      console.error("Chyba pri ukladaní do DB:", err.message);
      return res.status(500).json({ success: false, message: 'Chyba pri ukladaní fotky.' });
    }

    return res.json({ success: true, photo: cloudinaryUrl });
  } catch (err) {
    console.error("Chyba vo funkcii uploadProfilePhoto:", err.message);
    return res.status(500).json({ success: false, message: 'Neočakovaná chyba.' });
  }
};



// Nastavenie defaultnej profilovej fotky
exports.setDefaultProfilePhoto = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });
  }

  // ⚡️ Skutočné údaje z Cloudinary (pozri detail obrázka v Cloudinary)
  const defaultPublicId = 'profile_photos/default-avatar_z3c30l'; 
  const defaultUrl = 'https://res.cloudinary.com/dd8gjvv80/image/upload/v1724234234/profile_photos/default-avatar_z3c30l.jpg';

  try {
    // Zistíme, či má user uloženú fotku
    const [rows] = await db.query('SELECT user_photo_public_id FROM user WHERE id = ?', [userId]);
    const oldPublicId = rows[0]?.user_photo_public_id;

    // Ak mal vlastnú fotku (nie default), zmaž ju
    if (oldPublicId && oldPublicId !== defaultPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
        console.log('Vymazaný starý obrázok:', oldPublicId);
      } catch (err) {
        console.error('Chyba pri mazaní starého obrázka:', err.message);
      }
    }

    // Nastavíme default avatar
    await db.query(
      'UPDATE user SET user_photo = ?, user_photo_public_id = ? WHERE id = ?',
      [defaultUrl, defaultPublicId, userId]
    );

    return res.json({ success: true, photo: defaultUrl });
  } catch (error) {
    console.error('Chyba pri nastavovaní defaultnej fotky:', error);
    return res.status(500).json({ success: false, message: 'Chyba pri nastavovaní defaultnej fotky.' });
  }
};



