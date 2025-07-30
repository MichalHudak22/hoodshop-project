const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dynamická konfigurácia ukladania
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const category = req.body.category;
    const type = req.body.type;

    if (!category || !type) {
      return cb(new Error('Chýba kategória alebo typ produktu'), null);
    }

    // Dynamicky vytvor cestu
    const uploadPath = path.join(__dirname, '../src/img', category, type);
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/\s+/g, '-')         // nahrad medzery pomlčkami
      .replace(/[^a-zA-Z0-9\-]/g, '') // odstráň špeciálne znaky
      .toLowerCase();

    const safeFileName = `${baseName}-${timestamp}${ext}`;
    cb(null, safeFileName);
  }
});

// Filter MIME typov
const fileFilter = function (req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Povolené sú iba obrázky JPEG, PNG a WEBP'), false);
  }
  cb(null, true);
};

// Multer inštancia
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 MB
  fileFilter
});

module.exports = upload;
