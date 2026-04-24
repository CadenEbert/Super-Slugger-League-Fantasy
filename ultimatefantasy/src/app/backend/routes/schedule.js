const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.js');
const authMiddleware = require('../middleware/auth.js');

router.get('/leagues/:leagueId/schedule', authMiddleware, scheduleController.getSchedule);

router.post('/leagues/:leagueId/schedule', authMiddleware, scheduleController.generateSchedule);

router.delete('/leagues/:leagueId/schedule', authMiddleware, scheduleController.clearSchedule);

router.get('/leagues/:leagueId/schedule/metadata', authMiddleware, scheduleController.getScheduleMetadata);

router.get('/leagues/:leagueId/schedule/games', authMiddleware, scheduleController.getScheduleGames);

router.put('/leagues/:leagueId/schedule/start', authMiddleware, scheduleController.startSeason);

router.put('/leagues/:leagueId/schedule/game/:gameId', authMiddleware, scheduleController.updateGame);

router.get('/leagues/:leagueId/members', authMiddleware, scheduleController.getMembers);

router.put('/leagues/:leagueId/week/:weekNumber', authMiddleware, scheduleController.completeWeek);

router.put('/leagues/:leagueId/standings/update', authMiddleware, scheduleController.updateStandings);

router.get('/leagues/:leagueId/playoffs/teams', authMiddleware, scheduleController.getPlayoffTeams);

router.post('/leagues/:leagueId/playoffs/start', authMiddleware, scheduleController.startPlayoffs);

router.get('/leagues/:leagueId/playoffs/games', authMiddleware, scheduleController.getPlayoffGames);

router.put('/leagues/:leagueId/round/complete', authMiddleware, scheduleController.completeRound);

module.exports = router;