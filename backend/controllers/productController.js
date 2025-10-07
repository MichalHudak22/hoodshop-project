const db = require('../database');
const path = require('path');
const fs = require('fs');

// GET products by brand
const getProductsByBrand = async (req, res) => {
  const { brandName } = req.params;

  const cleanBrand = brandName.trim().toLowerCase();

  console.log('brandName param from URL:', brandName);
  console.log('cleanBrand used for SQL query:', cleanBrand);

  // GET products by brand
  const sql = `
  SELECT * FROM products 
  WHERE LOWER(brand) = ? AND is_active = 1
  ORDER BY id DESC 
  LIMIT 20
`;

  try {
    const [results] = await db.query(sql, [cleanBrand]);

    console.log('Products found:', results.length);

    if (!results || results.length === 0) {
      console.log(`No products found for brand: ${cleanBrand}`);
      return res.json([]);
    }

    return res.json(results);
  } catch (err) {
    console.error('DB error getProductsByBrand:', err);
    return res.status(500).json({ error: 'Chyba servera' });
  }
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
    { category: "cycling", type: "bikes" },
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
             AND is_active = 1
             AND carousel_group = 1
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
  const sql = "SELECT * FROM products WHERE category = ? AND type = ? AND is_active = 1";

  try {
    const [rows] = await db.query(sql, [category, type]);

    // 1️⃣ Dáta priamo z DB
    console.log("➡️ DB RAW images:", rows.map(p => p.image));

    // 2️⃣ Oprava URL (ak treba)
    const fixedRows = rows.map(p => {
      let image = p.image;
      if (image && image.startsWith("https//")) {
        image = image.replace("https//", "https://");
      }
      return { ...p, image };
    });

    // 3️⃣ Dáta ktoré posielame do frontu
    console.log("➡️ API RESPONSE images:", fixedRows.map(p => p.image));

    res.json(fixedRows);
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

  const sql = 'SELECT * FROM products WHERE LOWER(name) LIKE ? AND is_active = 1 LIMIT 20';


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

  const sql = "SELECT * FROM products WHERE carousel_group LIKE ? AND is_active = 1";

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

  const sql = 'SELECT * FROM products WHERE slug = ? AND is_active = 1';

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
    highlight_title, carousel_group,
    image // teraz očakávame URL
  } = req.body;

  if (!name || !category || !brand || !price || !type || !description || !slug || !image) {
    return res.status(400).json({ error: 'Chýbajú povinné polia alebo obrázok' });
  }

  try {
    const sql = `
      INSERT INTO products
      (name, category, brand, price, image, type, description, slug, highlight_title, carousel_group)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [dbResult] = await db.query(sql, [
      name, category, brand, price, image, type, description, slug,
      highlight_title || null,
      carousel_group || null
    ]);

    res.status(201).json({
      message: 'Product was successfully added.',
      productId: dbResult.insertId,
      imageUrl: image,
    });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Chyba servera pri vkladaní produktu' });
  }
};

module.exports = { addProduct };



// ADMIN - Soft delete product by slug
const deleteProductBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    // 1️⃣ Zisti produkt podľa slug
    const [products] = await db.query('SELECT id FROM products WHERE slug = ?', [slug]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Produkt nebol nájdený' });
    }

    const productId = products[0].id;

    // 2️⃣ Soft delete produktu
    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [productId]);

    // 3️⃣ Odstránenie produktu zo všetkých košíkov
    await db.query('DELETE FROM cart_items WHERE product_id = ?', [productId]);

    res.json({ message: 'Produkt bol soft-vymazaný a odstránený z košíkov používateľov' });
  } catch (err) {
    console.error('DB error deleteProductBySlug:', err);
    res.status(500).json({ error: 'Chyba servera pri mazaní produktu' });
  }
};

// productsController.js
const toggleProductActive = async (req, res) => {
  const slug = req.params.slug;

  try {
    // Najprv zisti aktuálny stav produktu
    const [productRows] = await db.query('SELECT id, is_active FROM products WHERE slug = ?', [slug]);
    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Produkt nenájdený' });
    }

    const product = productRows[0];

    // Prepni stav produktu
    const [result] = await db.query(
      'UPDATE products SET is_active = NOT is_active WHERE slug = ?',
      [slug]
    );

    // Ak sa produkt stal inactive, odstráň ho z košíkov
    if (product.is_active === 1) { // bol aktívny, teraz bude inactive
      await db.query('DELETE FROM cart_items WHERE product_id = ?', [product.id]);
    }

    res.status(200).json({ message: 'Stav produktu aktualizovaný' });
  } catch (err) {
    console.error('DB error toggleProductActive:', err);
    res.status(500).json({ message: 'Chyba servera pri aktualizácii produktu' });
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
  toggleProductActive,
};
