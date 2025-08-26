const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticateToken = require('../middleware/authenticateToken');

// ✅ Všetky routy s optional autentifikáciou
router.get('/', authenticateToken.optional, cartController.getCart);
router.post('/', authenticateToken.optional, cartController.addToCart);
router.get('/count', authenticateToken.optional, cartController.getCartCount); // 👈 volaj priamo z controlleru
router.patch('/:id', authenticateToken.optional, cartController.updateCartItem);
router.delete('/:id', authenticateToken.optional, cartController.removeFromCart);
router.delete('/', authenticateToken.optional, cartController.clearCart);


module.exports = router;
