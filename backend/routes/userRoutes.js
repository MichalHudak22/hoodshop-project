const express = require('express');
const rateLimit = require('express-rate-limit');

const {
  getUsers,
  createUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getUserById,
  getOrdersByUserId,
  deleteUserById,
  updateUserRole,
  verifyEmail,
} = require('../controllers/userController');

const authenticateToken = require('../middleware/authenticateToken');
const authorizeAdmin = require('../middleware/authorizeAdmin');
const router = express.Router();

// Tu definuj limiter pre login max 5 pokusov a ban na 10 minut
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minút
  max: 5,
  message: {
    status: 429,
    error: "Príliš veľa pokusov o prihlásenie, skúste to o 10 minút znova."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', getUsers);
router.post('/', createUser);

// Pridaj limiter ako middleware pre login endpoint
router.post('/login', loginLimiter, loginUser);

router.get('/verify-email', verifyEmail);

router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.delete('/profile', authenticateToken, deleteUserAccount);

router.get('/admin-panel', authenticateToken, authorizeAdmin, (req, res) => {
  res.json({ message: 'Vitaj v admin sekcii!' });
});

router.get('/admin/user/:id', authenticateToken, authorizeAdmin, getUserById);
router.delete('/admin/user/:id', authenticateToken, authorizeAdmin, deleteUserById);
router.get('/admin/user/:id/orders', authenticateToken, authorizeAdmin, getOrdersByUserId);
router.put('/admin/user/:id/role', authenticateToken, authorizeAdmin, updateUserRole);

module.exports = router;
