const cloudinary = require('./cloudinary'); // tvoje existujúce cloudinary.js
const db = require('../database');          // tvoje existujúce db.js
const fs = require('fs');
const path = require('path');

async function uploadFootballJerseys() {
  try {
    // cesta k priečinku s obrázkami football/jerseys
    const baseDir = path.join(__dirname, '..', 'src', 'img', 'products', 'football', 'jerseys');

    if (!fs.existsSync(baseDir) || !fs.statSync(baseDir).isDirectory()) {
      console.error('❌ Cesta k priečinku neexistuje alebo nie je priečinok:', baseDir);
      return;
    }

    const files = fs.readdirSync(baseDir);

    for (const file of files) {
      const filePath = path.join(baseDir, file);
      const slug = path.parse(file).name; // napr. 'jersey1.jpg' -> 'jersey1'

      try {
        // Upload na Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
          folder: `products/football/jerseys`,
        });

        console.log(`✅ ${file} uploaded: ${result.secure_url}`);

        // Aktualizácia stĺpca 'image' v DB podľa slugu
        await db.query(
          'UPDATE products SET image = ? WHERE slug = ?',
          [result.secure_url, slug]
        );

      } catch (err) {
        console.error(`❌ Chyba pri uploadovaní ${file}:`, err);
      }
    }

    console.log('🎉 Upload football/jerseys dokončený!');
  } catch (err) {
    console.error('❌ Chyba pri spracovaní priečinku:', err);
  } finally {
    db.end(); // uzavrieme pool pripojení
  }
}

// Spustenie skriptu
uploadFootballJerseys();
