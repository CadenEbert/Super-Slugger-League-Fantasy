const express = require('express');
const router = express.Router();
const freeagentController = require('../controllers/freeagentController.js');
const authMiddleware = require('../middleware/auth.js');


router.get('/leagues/:leagueId/freeagents', authMiddleware, freeagentController.getFreeAgents);

router.post('/leagues/:leagueId/rosters/:rosterId/players/:characterId', authMiddleware, freeagentController.addPlayerToRoster);

module.exports = router;