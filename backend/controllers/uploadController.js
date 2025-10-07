const db = require('../database');
const uploadSingle = require('../cloudinary/uploadAvatar');
const cloudinary = require('../cloudinary/cloudinary');

// Upload / replace profile photo
exports.uploadProfilePhoto = (req, res) => {
  uploadSingle(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });

    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Súbor nebol odoslaný.' });

    try {
      const [rows] = await db.query('SELECT user_photo_public_id FROM user WHERE id = ?', [userId]);
      const oldPublicId = rows?.[0]?.user_photo_public_id;

      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId);
      }

      const imageUrl = req.file.path;      // Cloudinary URL
      const publicId = req.file.filename;  // Cloudinary public_id

      await db.query(
        'UPDATE user SET user_photo = ?, user_photo_public_id = ? WHERE id = ?',
        [imageUrl, publicId, userId]
      );

      return res.json({ success: true, photo: imageUrl });
    } catch (error) {
      console.error('Chyba pri ukladaní obrázka:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });
};

// Reset profile photo na default
// Reset profile photo na default
exports.setDefaultProfilePhoto = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });

  const defaultUrl = 'https://res.cloudinary.com/dd8gjvv80/image/upload/v1755594977/default-avatar_z3c30l.jpg';

  try {
    const [rows] = await db.query('SELECT user_photo_public_id FROM user WHERE id = ?', [userId]);
    const oldPublicId = rows?.[0]?.user_photo_public_id;

    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId);
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

