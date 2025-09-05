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
    { category: 'football', type: 'jersey' },
    { category: 'football', type: 'ball' },
    { category: 'football', type: 'cleats' },
    { category: 'football', type: 'shinguards' },
    { category: 'hockey', type: 'jersey' },
    { category: 'hockey', type: 'helmets' },
    { category: 'hockey', type: 'skates' },
    { category: 'hockey', type: 'sticks' },
    { category: 'cycling', type: 'bike' },
    { category: 'cycling', type: 'gloves' },
    { category: 'cycling', type: 'helmets' },
    { category: 'cycling', type: 'clothes' },
  ];

  try {
    // Vytvoríme UNION ALL query
    const queries = productTypes.map(({ category, type }) => {
      return `(SELECT * FROM products WHERE category = ${db.escape(category)} AND type = ${db.escape(type)} ORDER BY id DESC LIMIT 1)`;
    });

    const finalQuery = queries.join(' UNION ALL ');

    // Použijeme pool.query s await
    const results = await db.query(finalQuery);

    res.json(results);
  } catch (err) {
    console.error('DB error getTopCarouselProducts:', err);
    res.status(500).json({ error: 'Chyba servera' });
  }
};

module.exports = { getTopCarouselProducts };


// GET products by category and type
const getProductsByCategoryAndType = (req, res) => {
  const { category, type } = req.params;
  const sql = 'SELECT * FROM products WHERE category = ? AND type = ?';

  db.query(sql, [category, type], (err, results) => {
    if (err) {
      console.error('DB error getProductsByCategoryAndType:', err);
      return res.status(500).json({ error: 'Chyba servera' });
    }
    res.json(results);
  });
};

// GET search products by name (q= query param)
const searchProductsByName = (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.status(400).json({ error: 'Chýba parameter vyhľadávania' });
  }

  const sql = 'SELECT * FROM products WHERE LOWER(name) LIKE ? LIMIT 20';
  db.query(sql, [`%${q.toLowerCase()}%`], (err, results) => {
    if (err) {
      console.error('DB error searchProductsByName:', err);
      return res.status(500).json({ error: 'Chyba servera' });
    }
    res.json(results || []);
  });
};


// GET products for carousel by category (using carousel_group pattern)
const getCarouselByCategory = (req, res) => {
  const { category } = req.params;
  const sql = "SELECT * FROM products WHERE carousel_group LIKE ?";

  db.query(sql, [`${category}_%`], (err, results) => {
    if (err) {
      console.error('DB error getCarouselByCategory:', err);
      return res.status(500).json({ error: 'Chyba servera' });
    }
    res.json(results);
  });
};

// GET product detail by slug
const getProductBySlug = (req, res) => {
  const { slug } = req.params;
  const sql = 'SELECT * FROM products WHERE slug = ?';

  db.query(sql, [slug], (err, results) => {
    if (err) {
      console.error('DB error getProductBySlug:', err);
      return res.status(500).json({ error: 'Chyba servera' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Produkt nebol nájdený' });
    }
    res.json(results[0]);
  });
};


// GET all products (for admin delete page)
const getAllProducts = (req, res) => {
  const sql = 'SELECT * FROM products ORDER BY id DESC';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('DB error getAllProducts:', err);
      return res.status(500).json({ error: 'Chyba servera' });
    }
    res.json(results);
  });
};


// ADMIN - Add product
const addProduct = (req, res) => {
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

  db.query(sql, [
    name, category, brand, price, imagePath, type, description, slug,
    highlight_title || null,
    carousel_group || null
  ], (err, result) => {
    if (err) {
      console.error('DB error addProduct:', err);
      return res.status(500).json({ error: 'Chyba servera pri vkladaní produktu' });
    }
    res.status(201).json({
      message: 'Product was successfully added.',
      productId: result.insertId,
      imagePath,
    });
  });
};


// ADMIN - Delete product by slug (and delete image file)
const deleteProductBySlug = (req, res) => {
  const { slug } = req.params;

  const sqlSelect = 'SELECT image FROM products WHERE slug = ?';

  db.query(sqlSelect, [slug], (err, results) => {
    if (err) {
      console.error('DB error select product for delete:', err);
      return res.status(500).json({ error: 'Chyba servera' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Produkt nebol nájdený' });
    }

    const imagePath = results[0].image;

    if (imagePath) {
      // Absolútna cesta na serveri, uprav podľa svojej štruktúry
      const fullPath = path.join(__dirname, '..', 'src', imagePath);

      fs.unlink(fullPath, (err) => {
        if (err) {
          console.warn('Chyba pri mazaní obrázka:', err);
          // nemusíme vracať chybu, môžeme pokračovať
        }
      });
    }

    const sqlDelete = 'DELETE FROM products WHERE slug = ?';

    db.query(sqlDelete, [slug], (err) => {
      if (err) {
        console.error('DB error delete product:', err);
        return res.status(500).json({ error: 'Chyba servera pri mazaní produktu' });
      }

      res.json({ message: 'Produkt bol vymazaný' });
    });
  });
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
