
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController.js');
const authMiddleware = require('../middleware/auth.js');
const filterMiddleware = require('../middleware/filter.js');

router.get('/profile', authMiddleware, profileController.getProfile);

router.put('/profile/username', authMiddleware, filterMiddleware, profileController.changeUsername);

module.exports = router;