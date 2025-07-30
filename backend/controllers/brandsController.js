const db = require('../database');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'; // render url alebo fallback na local

// Pomocná funkcia na pridanie base URL k obrázkom
const formatBrandPaths = (brand) => ({
  ...brand,
  brand_image: `${BASE_URL}${brand.brand_image}`,
  background_image: `${BASE_URL}${brand.background_image}`,
});

// Získaj všetky značky
const getAllBrands = (req, res) => {
  const sql = 'SELECT id, name, brand_image, brand_info, background_image, brand_Text FROM brands';

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });

    const formattedResults = results.map(formatBrandPaths);
    res.json(formattedResults);
  });
};

// Získaj len vybrané značky pre home-brands
const getSelectedBrands = (req, res) => {
  const sql = `
    SELECT id, name, brand_image 
    FROM brands 
    WHERE name IN (?, ?, ?, ?)
  `;
  const values = ['Adidas', 'Nike', 'Bauer', 'Trek'];

  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });

    const formatted = results.map(brand => ({
      ...brand,
      brand_image: `${BASE_URL}${brand.brand_image}`,
    }));

    res.json(formatted);
  });
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
    if (err) return res.status(500).json({ error: 'Database error', details: err });

    if (results.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const brand = formatBrandPaths(results[0]);
    res.json(brand);
  });
};

module.exports = {
  getAllBrands,
  getSelectedBrands,
  getBrandBySlug,
};
