const express = require('express');
const router = express.Router();
const tradesController = require('../controllers/trades.js');
const authMiddleware = require('../middleware/auth.js');
const { route } = require('./league.js');


router.get('/leagues/:leagueId/trades', authMiddleware, tradesController.getTrades);

router.get('/leagues/:leagueId/trades/characters', authMiddleware, tradesController.getAllCharacters);

router.get('/leagues/:leagueId/trades/rosters', authMiddleware, tradesController.getAllRosters);


module.exports = router;