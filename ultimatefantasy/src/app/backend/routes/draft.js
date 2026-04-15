const express = require('express');
const router = express.Router();
const draftController = require('../controllers/draft.js');
const authMiddleware = require('../middleware/auth.js');


router.get('/leagues/:leagueId/draft', authMiddleware, draftController.getDraftState);

module.exports = router;