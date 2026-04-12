const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController.js');
const authMiddleware = require('../middleware/auth.js');


router.get('/leagues', authMiddleware, leagueController.getLeagues);


router.post('/leagues', authMiddleware, leagueController.createLeague);


router.get('/leagues/:id', authMiddleware, leagueController.getLeagueById);


router.put('/leagues/:id', authMiddleware, leagueController.updateLeague);

module.exports = router;