const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.js');
const authMiddleware = require('../middleware/auth.js');

router.get('/leagues/:leagueId/schedule', authMiddleware, scheduleController.getSchedule);

module.exports = router;