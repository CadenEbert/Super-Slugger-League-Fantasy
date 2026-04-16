const express = require('express');
const router = express.Router();
const draftController = require('../controllers/draft.js');
const authMiddleware = require('../middleware/auth.js');


router.get('/leagues/:leagueId/draft', authMiddleware, draftController.getDraftState);

router.post('/draft/:draftId/join', authMiddleware, draftController.joinDraftChannel);

router.get('/league/:leagueId/draftId', authMiddleware, draftController.getDraftIdByLeagueId);

router.get('/league/:leagueId/draft/members', authMiddleware, draftController.getAllLeagueMembers);

router.put('/draft/:draftId/update', authMiddleware, draftController.updateDraftData);

module.exports = router;