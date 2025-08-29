const express = require('express');
const router = express.Router();

const {
  placeOrder,
  getOrdersSummary,
  getTopProducts,
  getAllOrders, // <--- pridaj
} = require('../controllers/orderController');

const authenticateToken = require('../middleware/authenticateToken');
const authorizeAdmin = require('../middleware/authorizeAdmin'); // <--- pridaj ak ešte nie je

// POST /api/orders - vytvorenie objednávky
router.post('/', authenticateToken.optional, placeOrder);

// GET /api/orders/summary - sumár objednávok
router.get('/summary', authenticateToken, getOrdersSummary);

// GET /api/orders/top-products - najpredávanejšie produkty
router.get('/top-products', getTopProducts);

// ✅ GET /api/orders/admin - všetky objednávky pre adminov
router.get('/admin', authenticateToken, authorizeAdmin, getAllOrders);

// test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Order route is working!' });
});

module.exports = router;
