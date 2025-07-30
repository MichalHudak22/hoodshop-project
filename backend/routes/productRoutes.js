const express = require('express');
const router = express.Router();
const {
  getProductsByBrand,
  getTopCarouselProducts,
  searchProductsByName,
  getCarouselByCategory,
  getProductsByCategoryAndType,
  getProductBySlug,
  getAllProducts,
  addProduct,
  deleteProductBySlug,
} = require('../controllers/productController');

const authenticateToken = require('../middleware/authenticateToken');
const upload = require('../middleware/uploadMiddleware'); // 👈 pridaj import

// GET all products 
router.get('/all', getAllProducts);

// Načítanie produktov podľa značky (napr. Nike)
router.get('/brand/:brandName', getProductsByBrand);

// pre Home-carousel
router.get('/carousel-top', getTopCarouselProducts);

// Vyhľadávanie podľa mena
router.get('/search', searchProductsByName);

// GET /products/:category/carousel
router.get('/:category/carousel', getCarouselByCategory);

// POST pridanie produktu - len pre adminov
router.post(
  '/',
  authenticateToken,
  (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Prístup zamietnutý' });
    }
    next();
  },
  upload.single('image'), // 👈 spracuj upload obrázku pod menom "image"
  addProduct // 👈 kontrolér bude pracovať s req.file a req.body
);



// ⚠️ Toto musí byť na konci!
router.get('/:category/:type', getProductsByCategoryAndType);

// DELETE /products/:slug - len pre adminov
router.delete(
  '/:slug',
  authenticateToken,
  (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Prístup zamietnutý' });
    }
    next();
  },
  deleteProductBySlug
);


// GET /products/:slug
router.get('/:slug', getProductBySlug);

module.exports = router;
