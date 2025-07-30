const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authenticateToken = require('../middleware/authenticateToken');

// konečná URL: /user/upload-photo
router.post('/photo', authenticateToken, uploadController.uploadProfilePhoto);
// /user/upload/default-photo
router.post('/default-photo', authenticateToken, uploadController.setDefaultProfilePhoto);


module.exports = router;
