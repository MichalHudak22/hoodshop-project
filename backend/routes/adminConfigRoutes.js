const express = require('express');
const router = express.Router();
const adminConfigController = require('../controllers/adminConfigController');

// GET ceny dopravy
router.get('/shipping-prices', adminConfigController.getShippingPrices);

// POST aktualizácia ceny dopravy
router.post('/shipping-prices', adminConfigController.updateShippingPrice);


// GET: Načítanie obsahu pre daný section_key
router.get('/section/:key', adminConfigController.getSectionContent);

// POST: Uloženie alebo úprava obsahu
router.post('/section', adminConfigController.updateSectionContent);

module.exports = router;
