const db = require('../database');

// Získaj všetky značky
const getAllBrands = (req, res) => {
  const sql = 'SELECT id, name, brand_image, brand_info, background_image, brand_Text FROM brands';

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    res.json(results);
  });
};


// Získaj len vybrané značky pre home-brands
const getSelectedBrands = async (req, res) => {
  const sql = `
    SELECT id, name, brand_image 
    FROM brands 
    WHERE name IN (?, ?, ?, ?)
  `;
  const values = ['Adidas', 'Nike', 'Bauer', 'Trek'];

  try {
    const results = await db.query(sql, values);
    res.json(results);
  } catch (err) {
    console.error('DB error getSelectedBrands:', err);
    res.status(500).json({ error: 'Database error', details: err });
  }
};

  // Získaj značku podľa názvu (slug)
const getBrandBySlug = (req, res) => {
  const slug = req.params.slug.toLowerCase();

  const sql = `
    SELECT id, name, brand_image, brand_info, background_image, brand_text 
    FROM brands 
    WHERE slug = ?
  `;

  db.query(sql, [slug], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json(results[0]);
  });
};


module.exports = {
  getAllBrands,
  getSelectedBrands,
  getBrandBySlug,
};
