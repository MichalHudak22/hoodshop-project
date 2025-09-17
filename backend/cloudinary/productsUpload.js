const cloudinary = require('./cloudinary'); // tvoje existujúce cloudinary.js
const db = require('../database');          // tvoje existujúce db.js
const fs = require('fs');
const path = require('path');

async function uploadAllProducts() {
const baseDir = path.join(__dirname, '..', 'src', 'img', 'products'); // správna cesta vzhľadom na cloudinary

  const categories = fs.readdirSync(baseDir); // football, hockey, cycling ...

  for (const category of categories) {
    const categoryPath = path.join(baseDir, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const types = fs.readdirSync(categoryPath); // balls, cleats, jerseys ...

    for (const type of types) {
      const typePath = path.join(categoryPath, type);
      if (!fs.statSync(typePath).isDirectory()) continue;

      const files = fs.readdirSync(typePath);

      for (const file of files) {
        const filePath = path.join(typePath, file);
        const slug = path.parse(file).name; // napr. ball2.jpg -> 'ball2'

        try {
          // Upload do Cloudinary
          const result = await cloudinary.uploader.upload(filePath, {
            folder: `products/${category}/${type}`,
          });

          console.log(`${file} uploaded: ${result.secure_url}`);

          // Aktualizácia databázy podľa slugu
          await db.query(
            'UPDATE products SET image = ? WHERE slug = ?',
            [result.secure_url, slug]
          );
        } catch (err) {
          console.error(`Chyba pri uploadovaní ${file}:`, err.message);
        }
      }
    }
  }

  console.log('✅ Upload všetkých produktov dokončený!');
}

uploadAllProducts();
