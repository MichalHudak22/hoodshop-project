const express = require('express');
const router = express.Router();
const { getAllBrands, getSelectedBrands, getBrandBySlug } = require('../controllers/brandsController');

router.get('/', getAllBrands);                 // => /api/brands
router.get('/selected', getSelectedBrands);    // => /api/brands/selected
router.get('/:slug', getBrandBySlug); 

module.exports = router;
