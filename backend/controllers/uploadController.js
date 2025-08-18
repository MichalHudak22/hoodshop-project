const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadProfilePhoto = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });

  upload.single('photo')(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return res.status(400).json({ success: false, message: 'Súbor nebol odoslaný.' });

    try {
      // 1️⃣ Zisti starý public_id
      const [rows] = await db.query('SELECT user_photo_public_id FROM user WHERE id = ?', [userId]);
      const oldPublicId = rows[0]?.user_photo_public_id;

      // 2️⃣ Vymaž starý obrázok
      if (oldPublicId && !oldPublicId.includes('default-avatar')) {
        await cloudinary.uploader.destroy(oldPublicId);
      }

      // 3️⃣ Uploadni nový obrázok na Cloudinary
      const result = await cloudinary.uploader.upload_stream(
        { folder: 'profile_photos', transformation: [{ width: 500, height: 500, crop: 'limit' }] },
        async (error, result) => {
          if (error) return res.status(500).json({ success: false, message: error.message });

          await db.query(
            'UPDATE user SET user_photo = ?, user_photo_public_id = ? WHERE id = ?',
            [result.secure_url, result.public_id, userId]
          );

          return res.json({ success: true, photo: result.secure_url });
        }
      );

      // Naplníme stream súborom
      result.end(req.file.buffer);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Chyba pri uploadovaní fotky.' });
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
