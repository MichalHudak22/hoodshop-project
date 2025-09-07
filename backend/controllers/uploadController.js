const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');

// Nastavenie úložiska
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.userId;
    const userFolder = path.join(__dirname, '..', 'uploads', 'profile_photos', userId.toString());
    if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true });
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

// Hlavná funkcia pre upload
exports.uploadProfilePhoto = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });

    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Súbor nebol odoslaný.' });

    const fileName = req.file.filename;
    const relativePath = `/uploads/profile_photos/${userId}/${fileName}`;
    const userFolder = path.join(__dirname, '..', 'uploads', 'profile_photos', userId.toString());

    try {
      // Vymazať staré fotky okrem aktuálnej
      const allFiles = fs.readdirSync(userFolder);
      for (const file of allFiles) {
        if (file !== fileName) fs.unlinkSync(path.join(userFolder, file));
      }

      // Uložiť cestu do DB cez pool
      await db.query('UPDATE user SET user_photo = ? WHERE id = ?', [relativePath, userId]);

      return res.json({ success: true, photo: relativePath });
    } catch (error) {
      console.error('Chyba pri mazaní alebo ukladaní obrázka:', error);
      return res.status(500).json({ success: false, message: 'Chyba pri ukladaní do databázy.' });
    }
  });
};

// Nastavenie defaultnej fotky
exports.setDefaultProfilePhoto = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'Neautorizovaný prístup.' });

  const defaultPath = '/uploads/profile_photos/default-avatar.jpg';
  const userFolder = path.join(__dirname, '..', 'uploads', 'profile_photos', userId.toString());

  try {
    // Aktualizovať DB
    await db.query('UPDATE user SET user_photo = ? WHERE id = ?', [defaultPath, userId]);

    // Vymazať všetky vlastné fotky používateľa
    if (fs.existsSync(userFolder)) {
      const files = fs.readdirSync(userFolder);
      for (const file of files) fs.unlinkSync(path.join(userFolder, file));
    }

    return res.json({ success: true, photo: defaultPath });
  } catch (error) {
    console.error('Chyba pri nastavovaní defaultnej fotky:', error);
    return res.status(500).json({ success: false, message: 'Chyba pri nastavovaní defaultnej fotky.' });
  }
};
