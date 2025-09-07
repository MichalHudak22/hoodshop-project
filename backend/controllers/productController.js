const db = require('../database');
const path = require('path');
const fs = require('fs');

// GET products by brand
const getProductsByBrand = (req, res) => {
  const { brandName } = req.params;
  const sql = 'SELECT * FROM products WHERE brand = ? ORDER BY id DESC LIMIT 20';

  db.query(sql, [brandName], (err, results) => {
    if (err) {
      console.error('DB error getProductsByBrand:', err);
      return res.status(500).json({ error: 'Chyba servera' });
    }
    res.json(results);
  });
};


// GET top carousel products (one product per category/type pair)
const getTopCarouselProducts = async (req, res) => {
  const productTypes = [
    { category: "football", type: "jersey" },
    { category: "football", type: "ball" },
    { category: "football", type: "cleats" },
    { category: "football", type: "shinguards" },
    { category: "hockey", type: "jersey" },
    { category: "hockey", type: "helmets" },
    { category: "hockey", type: "skates" },
    { category: "hockey", type: "sticks" },
    { category: "cycling", type: "bike" },
    { category: "cycling", type: "gloves" },
    { category: "cycling", type: "helmets" },
    { category: "cycling", type: "clothes" },
  ];

  try {
    // Každý SELECT obalíme do UNION ALL
    let queries = productTypes.map(({ category, type }) => {
      return `(SELECT * FROM products 
               WHERE category = ${db.escape(category)} 
                 AND type = ${db.escape(type)} 
               ORDER BY id DESC LIMIT 1)`;
    });

    const finalQuery = queries.join(" UNION ALL ");

    // await + destructuring
    const [rows] = await db.query(finalQuery);

    res.json(rows);
  } catch (err) {
    console.error("DB error getTopCarouselProducts:", err);
    res.status(500).json({ error: "Chyba servera" });
  }
};


// GET products by category and type
const getProductsByCategoryAndType = async (req, res) => {
  const { category, type } = req.params;
  const sql = "SELECT * FROM products WHERE category = ? AND type = ?";

  try {
    const [rows] = await db.query(sql, [category, type]);
    res.json(rows);
  } catch (err) {
    console.error("DB error getProductsByCategoryAndType:", err);
    res.status(500).json({ error: "Chyba servera" });
  }
};


// GET search products by name (q= query param)
const searchProductsByName = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Chýba parameter vyhľadávania' });
  }

  const sql = 'SELECT * FROM products WHERE LOWER(name) LIKE ? LIMIT 20';

  try {
    const [rows] = await db.query(sql, [`%${q.toLowerCase()}%`]);
    res.json(rows);
  } catch (err) {
    console.error('DB error searchProductsByName:', err);
    res.status(500).json({ error: 'Chyba servera' });
  }
};


// GET products for carousel by category (using carousel_group pattern)
const getCarouselByCategory = async (req, res) => {
  const { category } = req.params;
  const sql = "SELECT * FROM products WHERE carousel_group LIKE ?";

  try {
    const [rows] = await db.query(sql, [`${category}_%`]);
    res.json(rows);
  } catch (err) {
    console.error('DB error getCarouselByCategory:', err);
    res.status(500).json({ error: 'Chyba servera' });
  }
};

// GET product detail by slug
const getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  const sql = 'SELECT * FROM products WHERE slug = ?';

  try {
    const [rows] = await db.query(sql, [slug]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produkt nebol nájdený' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('DB error getProductBySlug:', err);
    res.status(500).json({ error: 'Chyba servera' });
  }
};


const getAllProducts = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM products ORDER BY id DESC');
    res.json(results);
  } catch (err) {
    console.error('DB error getAllProducts:', err);
    res.status(500).json({ error: 'Chyba servera' });
  }
};


// ADMIN - Add product
const addProduct = async (req, res) => {
  const {
    name, category, brand, price,
    type, description, slug,
    highlight_title, carousel_group
  } = req.body;

  if (!name || !category || !brand || !price || !type || !description || !slug || !req.file) {
    return res.status(400).json({ error: 'Chýbajú povinné polia alebo obrázok' });
  }

  // Pridáme prefix cesty k obrázku
  const imagePath = `/img/${category}/${type}/${req.file.filename}`;

  const sql = `
    INSERT INTO products
    (name, category, brand, price, image, type, description, slug, highlight_title, carousel_group)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await db.query(sql, [
      name, category, brand, price, imagePath, type, description, slug,
      highlight_title || null,
      carousel_group || null
    ]);

    res.status(201).json({
      message: 'Product was successfully added.',
      productId: result.insertId,
      imagePath,
    });
  } catch (err) {
    console.error('DB error addProduct:', err);
    res.status(500).json({ error: 'Chyba servera pri vkladaní produktu' });
  }
};



// ADMIN - Delete product by slug (and delete image file)
const deleteProductBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    // 1️⃣ Získať cestu k obrázku
    const [results] = await db.query('SELECT image FROM products WHERE slug = ?', [slug]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Produkt nebol nájdený' });
    }

    const imagePath = results[0].image;

    // 2️⃣ Vymazať obrázok (ak existuje)
    if (imagePath) {
      const fullPath = path.join(__dirname, '..', 'src', imagePath);
      try {
        await fs.promises.unlink(fullPath);
      } catch (err) {
        console.warn('Chyba pri mazaní obrázka:', err);
        // pokračujeme aj keď sa nepodarí vymazať obrázok
      }
    }

    // 3️⃣ Vymazať produkt z DB
    await db.query('DELETE FROM products WHERE slug = ?', [slug]);

    res.json({ message: 'Produkt bol vymazaný' });
  } catch (err) {
    console.error('DB error deleteProductBySlug:', err);
    res.status(500).json({ error: 'Chyba servera pri mazaní produktu' });
  }
};



module.exports = {
  getProductsByBrand,
  getTopCarouselProducts,
  getProductsByCategoryAndType,
  getCarouselByCategory,
  searchProductsByName,
  getProductBySlug,
  getAllProducts,
  addProduct,
  deleteProductBySlug,
};
