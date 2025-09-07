const db = require('../database');

// Získaj všetky značky
const getAllBrands = async (req, res) => {
  const sql = 'SELECT id, name, brand_image, brand_info, background_image, brand_Text FROM brands';

  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error('DB error getAllBrands:', err);
    res.status(500).json({ error: 'Database error', details: err });
  }
};


// Získaj len vybrané značky pre home-brands
const getSelectedBrands = async (req, res) => {
  const sql = `
    SELECT id, name, brand_image 
    FROM brands 
    WHERE name IN (?, ?, ?, ?)
  `;
  const values = ["Adidas", "Nike", "Bauer", "Trek"];

  try {
    const [rows] = await db.query(sql, values);
    res.json(rows);
  } catch (err) {
    console.error("DB error getSelectedBrands:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// GET značku podľa slug
const getBrandBySlug = async (req, res) => {
  const slug = req.params.slug.toLowerCase();

  const sql = `
    SELECT id, name, brand_image, brand_info, background_image, brand_text 
    FROM brands 
    WHERE slug = ?
  `;

  try {
    const [rows] = await db.query(sql, [slug]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("DB error getBrandBySlug:", err);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = {
  getAllBrands,
  getSelectedBrands,
  getBrandBySlug,
};
