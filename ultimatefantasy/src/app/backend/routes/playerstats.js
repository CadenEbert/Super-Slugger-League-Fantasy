const express = require('express');
const router = express.Router();
const playerstatsController = require('../controllers/playerstatsController.js');
const authMiddleware = require('../middleware/auth.js');


router.get('/leagues/:leagueId/playerstats/characters', authMiddleware, playerstatsController.getFilteredCharacters);
router.get('/leagues/:leagueId/playerstats', authMiddleware, playerstatsController.getPlayerStats);
router.post('/leagues/:leagueId/playerstats/add', authMiddleware, playerstatsController.addPlayerStats);
router.put('/leagues/:leagueId/playerstats', authMiddleware, playerstatsController.updatePlayerStats);
router.delete('/leagues/:leagueId/playerstats/delete', authMiddleware, playerstatsController.deletePlayerStats);

module.exports = router;