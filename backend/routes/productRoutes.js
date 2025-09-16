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
  toggleProductActive,
} = require('../controllers/productController');

const authenticateToken = require('../middleware/authenticateToken');
const upload = require('../middleware/uploadMiddleware');

// =====================================================
// Všetky GET routy musia byť pred wildcard `/:slug`
// =====================================================

// GET all products
router.get('/all', getAllProducts);

// GET products by brand
router.get('/brand/:brandName', getProductsByBrand);

// Home carousel
router.get('/carousel-top', getTopCarouselProducts);

// Search products by name
router.get('/search', searchProductsByName);

// Carousel by category
router.get('/:category/carousel', getCarouselByCategory);

// Products by category & type
router.get('/:category/:type', getProductsByCategoryAndType);


router.patch('/toggle/:slug', authenticateToken, toggleProductActive);

// GET single product by slug (musí byť úplne na konci, aby neblokovalo iné route)
router.get('/:slug', getProductBySlug);

// =====================================================
// POST / DELETE routes pre adminov
// =====================================================

// POST add product (admin only)
router.post(
  '/',
  authenticateToken,
  (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Prístup zamietnutý' });
    }
    next();
  },
  upload.single('image'),
  addProduct
);

// DELETE product by slug (admin only)
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

module.exports = router;
