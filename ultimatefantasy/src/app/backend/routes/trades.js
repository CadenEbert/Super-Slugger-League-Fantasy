const express = require('express');
const router = express.Router();
const tradesController = require('../controllers/trades.js');
const authMiddleware = require('../middleware/auth.js');
const { route } = require('./league.js');


router.get('/leagues/:leagueId/trades', authMiddleware, tradesController.getTrades);

router.get('/leagues/:leagueId/trades/characters', authMiddleware, tradesController.getAllCharacters);

router.get('/leagues/:leagueId/trades/rosters', authMiddleware, tradesController.getAllRosters);

router.get('/trades/characters/names', authMiddleware, tradesController.getAllCharacterNames);

router.post('/leagues/:leagueId/trades', authMiddleware, tradesController.createTrade);

router.put('/trades/:tradeId/accept', authMiddleware, tradesController.acceptTrade);

router.put('/trades/:tradeId/reject', authMiddleware, tradesController.rejectTrade);

router.get('/leagues/:leagueId/roster-limit', authMiddleware, tradesController.getRosterLimit);

module.exports = router;
