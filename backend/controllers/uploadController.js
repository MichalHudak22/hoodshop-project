const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');

// Nastavenie úložiska
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.userId;
    const userFolder = path.join(__dirname, '..', 'uploads', 'profile_photos', userId.toString());
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }
    cb(null, userFolder);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.jfif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Nepovolený formát obrázku'));
  },
}).single('photo');

// Hlavná funkcia
exports.uploadProfilePhoto = (req, res) => {
  console.log('User ID:', req.userId);

  upload(req, res, async function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Súbor nebol odoslaný.' });
    }

    const fileName = req.file.filename;
    const relativePath = `/uploads/profile_photos/${userId}/${fileName}`;
    const userFolder = path.join(__dirname, '..', 'uploads', 'profile_photos', userId.toString());

    try {
      // ⚠️ Vymažeme všetky súbory v priečinku používateľa okrem aktuálne nahraného
      const allFiles = fs.readdirSync(userFolder);
      allFiles.forEach(file => {
        if (file !== fileName) {
          const filePath = path.join(userFolder, file);
          fs.unlinkSync(filePath);
          console.log('Vymazaný starý súbor:', filePath);
        }
      });

      // 💾 Ulož cestu do databázy
      await db.query('UPDATE user SET user_photo = ? WHERE id = ?', [relativePath, userId]);

      console.log('Fotka nahraná, cesta:', relativePath);
      return res.json({ success: true, photo: relativePath });
    } catch (error) {
      console.error('Chyba pri mazaní alebo ukladaní obrázka:', error);
      return res.status(500).json({ success: false, message: 'Chyba pri ukladaní do databázy.' });
    }
  });
};


exports.setDefaultProfilePhoto = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });

  const defaultPath = '/uploads/profile_photos/default-avatar.jpg';

  try {
    // Uprav cestu v databáze
    await db.query('UPDATE user SET user_photo = ? WHERE id = ?', [defaultPath, userId]);

    // Môžeme tiež vymazať všetky fotky v osobnom priečinku používateľa
    const userFolder = path.join(__dirname, '..', 'uploads', 'profile_photos', userId.toString());
    if (fs.existsSync(userFolder)) {
      fs.readdirSync(userFolder).forEach(file => {
        const filePath = path.join(userFolder, file);
        fs.unlinkSync(filePath);
      });
      console.log('Vymazané všetky vlastné profilové fotky pre používateľa:', userId);
    }

    return res.json({ success: true, photo: defaultPath });
  } catch (error) {
    console.error('Chyba pri nastavovaní defaultnej fotky:', error);
    return res.status(500).json({ success: false, message: 'Chyba pri nastavovaní defaultnej fotky.' });
  }
};


