
const express = require('express');
const router = express.Router();
const rosterController = require('../controllers/rosterController.js');
const authMiddleware = require('../middleware/auth.js');

router.get('/leagues/:leagueId/rosters', authMiddleware, rosterController.getRoster);

router.get('/leagues/:leagueId/rosters/can-create', authMiddleware, rosterController.canCreateRoster);

router.post('/leagues/:leagueId/rosters', authMiddleware, rosterController.createRoster);

router.get('/leagues/:leagueId/rosters/:rosterId', authMiddleware, rosterController.getRosterById);

router.post('/leagues/:leagueId/rosters/:rosterId/players/:characterId/position', authMiddleware, rosterController.changePlayerPosition);

router.post('/leagues/:leagueId/rosters/:rosterId/players/:characterId/batting-order', authMiddleware, rosterController.changePlayerBattingOrder);

router.delete('/leagues/:leagueId/rosters/:rosterId/players/:characterId', authMiddleware, rosterController.removePlayer);

router.get('/rosters/:rosterId/owner-id', authMiddleware, rosterController.getOwnerId);



module.exports = router;