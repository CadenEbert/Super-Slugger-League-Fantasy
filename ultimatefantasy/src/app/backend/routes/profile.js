
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController.js');
const authMiddleware = require('../middleware/auth.js');

router.get('/profile', authMiddleware, profileController.getProfile);

module.exports = router;