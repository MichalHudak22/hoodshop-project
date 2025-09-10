const express = require('express');

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

router.get('/', getUsers);
router.post('/', createUser);

router.post('/login', loginUser); // <-- tu už len samotný loginUser

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
