const express = require('express');
const router = express.Router();
const freeagentController = require('../controllers/freeagentController.js');
const authMiddleware = require('../middleware/auth.js');


router.get('/leagues/:leagueId/freeagents', authMiddleware, freeagentController.getFreeAgents);

module.exports = router;