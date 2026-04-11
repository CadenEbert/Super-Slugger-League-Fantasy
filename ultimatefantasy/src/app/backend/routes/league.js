const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController.js');


router.get('/leagues', leagueController.getLeagues);


router.post('/leagues', leagueController.createLeague);


router.get('/leagues/:id', leagueController.getLeagueById);


router.put('/leagues/:id', leagueController.updateLeague);


router.delete('/leagues/:id', leagueController.deleteLeague);

module.exports = router;