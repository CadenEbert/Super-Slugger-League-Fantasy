
const express = require('express');
const router = express.Router();
const rosterController = require('../controllers/rosterController.js');
const authMiddleware = require('../middleware/auth.js');

router.get('/leagues/:leagueId/rosters', authMiddleware, rosterController.getRoster);

router.get('/leagues/:leagueId/rosters/can-create', authMiddleware, rosterController.canCreateRoster);

router.post('/leagues/:leagueId/rosters', authMiddleware, rosterController.createRoster);

module.exports = router;