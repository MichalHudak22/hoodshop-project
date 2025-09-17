const express = require('express');
const router = express.Router();

const {
  placeOrder,
  getOrdersSummary,
  getTopProducts,
  getAllOrders, // <--- už tam máš
  getTopCustomers, // <--- pridaj toto
} = require('../controllers/orderController');

const authenticateToken = require('../middleware/authenticateToken');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// POST /api/orders - vytvorenie objednávky
router.post('/', authenticateToken.optional, placeOrder);

// GET /api/orders/summary - sumár objednávok
router.get('/summary', authenticateToken, getOrdersSummary);

// GET /api/orders/top-products - najpredávanejšie produkty
router.get('/top-products', authenticateToken, getTopProducts);

// ✅ GET /api/orders/admin - všetky objednávky pre adminov
router.get('/admin', authenticateToken, authorizeAdmin, getAllOrders);

// ✅ GET /api/orders/top-customers - top 5 zákazníkov
router.get('/top-customers', authenticateToken, authorizeAdmin, getTopCustomers);

// test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Order route is working!' });
});

module.exports = router;
