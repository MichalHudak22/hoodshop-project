const db = require('../database');
const upload = require('../cloudinary/upload'); // multer-storage-cloudinary
console.log('💡 upload:', upload);
const cloudinary = require('../cloudinary/cloudinary');

// Upload / replace profile photo
exports.uploadProfilePhoto = (req, res) => {
  upload(req, res, async (err) => {
    console.log('💡 Multer callback začal');          // ✅ Log začiatku
    console.log('err:', err);                        // ✅ Ak Multer vráti chybu

    if (err) return res.status(400).json({ success: false, message: err.message });

    const userId = req.userId;
    console.log('userId:', userId);                  // ✅ Skontroluj userId

    if (!userId) return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });
    console.log('req.file:', req.file);             // ✅ Tu zistíš, či Multer dostal súbor
    console.log('req.body:', req.body);             // ✅ Skontroluj telo requestu, ak obsahuje niečo navyše

    if (!req.file) return res.status(400).json({ success: false, message: 'Súbor nebol odoslaný.' });

    try {
      const [rows] = await db.query('SELECT user_photo_public_id FROM user WHERE id = ?', [userId]);
      console.log('DB rows:', rows);                // ✅ Skontroluj, čo vracia DB
      const oldPublicId = rows && rows[0] ? rows[0].user_photo_public_id : null;
      console.log('oldPublicId:', oldPublicId);    // ✅ Skontroluj starý avatar

      if (oldPublicId) {
        const destroyRes = await cloudinary.uploader.destroy(oldPublicId);
        console.log('Destroy response:', destroyRes); // ✅ Výsledok mazania Cloudinary
      }

      const imageUrl = req.file.path;
      const publicId = req.file.filename;
      console.log('New imageUrl:', imageUrl, 'publicId:', publicId); // ✅ Nový obrázok

      await db.query(
        'UPDATE user SET user_photo = ?, user_photo_public_id = ? WHERE id = ?',
        [imageUrl, publicId, userId]
      );
      console.log('✅ DB updated successfully');

      return res.json({ success: true, photo: imageUrl });
    } catch (error) {
      console.error('Chyba pri ukladaní obrázka:', error);
      return res.status(500).json({ success: false, message: error.message }); // lepšie dať error.message
    }
  });
};


// Reset profile photo na default
exports.setDefaultProfilePhoto = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });

  // Default avatar – môžeš si dať Cloudinary URL
const defaultUrl = 'https://res.cloudinary.com/dd8gjvv80/image/upload/v1694260000/profile_photos/default-avatar.jpg';


  try {
    // 1️⃣ Zisti starý avatar
    const [rows] = await db.query('SELECT user_photo_public_id FROM user WHERE id = ?', [userId]);
    const oldPublicId = rows && rows[0] ? rows[0].user_photo_public_id : null;

    // 2️⃣ Zmaž starý avatar, ak existuje
    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId);
    }

    // 3️⃣ Ulož default avatar do DB
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
