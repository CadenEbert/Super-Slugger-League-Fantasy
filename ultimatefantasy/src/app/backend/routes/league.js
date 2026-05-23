const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController.js');
const authMiddleware = require('../middleware/auth.js');


router.get('/leagues', authMiddleware, leagueController.getLeagues);


router.post('/leagues', authMiddleware, leagueController.createLeague);

router.get('/leagues/:id/roster/players/leagueid', authMiddleware, leagueController.getRosterPlayersByLeagueId);

router.get('/leagues/:id', authMiddleware, leagueController.getLeagueById);

router.get('/leagues/:id/protections', authMiddleware, leagueController.getProtections);

router.put('/leagues/:id', authMiddleware, leagueController.updateLeague);

router.get('/leagues/:id/rosters/user/:userId', authMiddleware, leagueController.getUsersRosterId);

router.delete('/leagues/:id', authMiddleware, leagueController.deleteLeague);

router.delete('/leagues/:id/reset', authMiddleware, leagueController.resetLeague);

router.post('/leagues/:id/draft-settings', authMiddleware, leagueController.updateDraftSettings);

router.post('/leagues/:id/roster-limit', authMiddleware, leagueController.updateRosterLimit);

router.put('/leagues/:id/protection-limit', authMiddleware, leagueController.updateProtectionLimit);

router.post('/leagues/:id/join', authMiddleware, leagueController.joinLeague);

router.get('/leagues/:id/owner-id', authMiddleware, leagueController.getOwnerId);

router.delete('/league/:id/leave', authMiddleware, leagueController.leaveLeague)

module.exports = router;