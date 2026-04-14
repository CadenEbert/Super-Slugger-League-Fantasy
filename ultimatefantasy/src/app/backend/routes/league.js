const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController.js');
const authMiddleware = require('../middleware/auth.js');


router.get('/leagues', authMiddleware, leagueController.getLeagues);


router.post('/leagues', authMiddleware, leagueController.createLeague);


router.get('/leagues/:id', authMiddleware, leagueController.getLeagueById);


router.put('/leagues/:id', authMiddleware, leagueController.updateLeague);

router.get('/leagues/:id/rosters/user/:userId', authMiddleware, leagueController.getUsersRosterId);

router.delete('/leagues/:id', authMiddleware, leagueController.deleteLeague);

router.post('/leagues/:id/draft-settings', authMiddleware, leagueController.updateDraftSettings);

router.post('/leagues/:id/roster-limit', authMiddleware, leagueController.updateRosterLimit);

module.exports = router;