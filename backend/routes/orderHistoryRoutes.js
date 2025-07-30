// routes/orderHistoryRoutes.js
const express = require('express');
const router = express.Router();

const { getUserOrders, getOrdersByUserIdForAdmin } = require('../controllers/orderHistoryController');
const authenticateToken = require('../middleware/authenticateToken');

// Tu je problémový riadok
router.get('/history', authenticateToken, getUserOrders);

router.get('/history/:userId', authenticateToken, getOrdersByUserIdForAdmin);


module.exports = router;
