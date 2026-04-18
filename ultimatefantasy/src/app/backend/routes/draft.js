const express = require('express');
const router = express.Router();
const draftController = require('../controllers/draft.js');
const authMiddleware = require('../middleware/auth.js');


router.get('/leagues/:leagueId/draft', authMiddleware, draftController.getDraftState);

router.post('/draft/:draftId/join', authMiddleware, draftController.joinDraftChannel);

router.get('/league/:leagueId/draftId', authMiddleware, draftController.getDraftIdByLeagueId);

router.get('/league/:leagueId/draft/members', authMiddleware, draftController.getAllLeagueMembers);

router.put('/draft/:draftId/update', authMiddleware, draftController.updateDraftData);

router.get('/draft/:draftId/players', authMiddleware, draftController.getDraftPlayers);

router.post('/draft/:draftId/pause', authMiddleware, draftController.pauseDraftTimer);

router.post('/draft/:draftId/start', authMiddleware, draftController.startDraftTimer);

router.get('/draft/:draftId/playerpool', authMiddleware, draftController.getPlayerPool);

router.get('/players', authMiddleware, draftController.getAllPlayers);

router.post('/draft/:draftId/pick', authMiddleware, draftController.makeDraftPick);

module.exports = router;