const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.js');
const authMiddleware = require('../middleware/auth.js');

router.post('/auth/signup', authController.signUp);

router.post('/auth/login', authController.signIn);

router.get('/user-id', authMiddleware, authController.getMe);

module.exports = router;

