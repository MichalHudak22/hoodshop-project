const cloudinary = require('./cloudinary'); 
const db = require('../database');          
const fs = require('fs');
const path = require('path');

async function uploadFootballJersey() {
  try {
    // opravená cesta k priečinku
    const baseDir = path.join(__dirname, '..', 'src', 'img', 'products', 'football', 'jersey');

    if (!fs.existsSync(baseDir) || !fs.statSync(baseDir).isDirectory()) {
      console.error('❌ Cesta k priečinku neexistuje alebo nie je priečinok:', baseDir);
      return;
    }

    const files = fs.readdirSync(baseDir);

    for (const file of files) {
      const filePath = path.join(baseDir, file);
      const slug = path.parse(file).name;

      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: `products/football/jersey`,
        });

        console.log(`✅ ${file} uploaded: ${result.secure_url}`);

        await db.query(
          'UPDATE products SET image = ? WHERE slug = ?',
          [result.secure_url, slug]
        );
      } catch (err) {
        console.error(`❌ Chyba pri uploadovaní ${file}:`, err);
      }
    }

    console.log('🎉 Upload football/jersey dokončený!');
  } catch (err) {
    console.error('❌ Chyba pri spracovaní priečinku:', err);
  }
}

// Spustenie skriptu
uploadFootballJersey();
