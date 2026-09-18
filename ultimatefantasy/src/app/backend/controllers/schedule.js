const scheduleService = require('../services/schedule.js');

exports.getSchedule = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const schedule = await scheduleService.getSchedule(leagueId);
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
}

exports.generateSchedule = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const totalWeeks = req.body.total_weeks;
        const numberInPlayoffs = req.body.number_in_playoffs;
        console.log('Received generate schedule request with:', { leagueId, totalWeeks, numberInPlayoffs });
        const schedule = await scheduleService.generateSchedule(leagueId, totalWeeks, numberInPlayoffs);
        res.json({ games: schedule });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate schedule' });
    }
}

exports.clearSchedule = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        await scheduleService.clearSchedule(leagueId);
        res.json({ message: 'Schedule cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear schedule' });
    }
}

exports.getScheduleMetadata = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const metadata = await scheduleService.getScheduleMetadata(leagueId);
        res.json(metadata);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch schedule metadata' });
    }
}

exports.getScheduleGames = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const games = await scheduleService.getScheduleGames(leagueId);
        res.json(games);

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch schedule games' });
    }
}

exports.startSeason = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        await scheduleService.startSeason(leagueId);
        res.json({ message: 'Season started successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to start season' });
    }
}

exports.updateGame = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const gameId = req.params.gameId;
        const homeScore = req.body.home_score;
        const awayScore = req.body.away_score;
        const stadium = req.body.stadium;
        const homeTeam = req.body.home_team;
        const awayTeam = req.body.away_team;
        const homeTeamuuid = req.body.home_team_uuid;
        const awayTeamuuid = req.body.away_team_uuid;

        await scheduleService.updateGame(leagueId, gameId, homeTeam, awayTeam, homeScore, awayScore, stadium, homeTeamuuid, awayTeamuuid);
        res.json({ message: 'Game updated successfully' });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'Failed to update game' });
    }
}

exports.getMembers = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const members = await scheduleService.getMembers(leagueId);
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch members' });
    }
}

exports.completeWeek = async (req, res) => {
    try {
        console.log('Received complete week request with:', { leagueId: req.params.leagueId, weekNumber: req.params.weekNumber });
        const leagueId = req.params.leagueId;
        const weekNumber = req.params.weekNumber;
        await scheduleService.completeWeek(leagueId, weekNumber);
        res.json({ message: `Week ${weekNumber} completed successfully` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to complete week' });
    }
}

exports.updateStandings = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const response = await scheduleService.updateStandings(leagueId);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update standings' });
    }
}

exports.getPlayoffTeams = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const playoffTeams = await scheduleService.getPlayoffTeams(leagueId);
        res.json(playoffTeams);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch playoff teams' });
    }
}

exports.startPlayoffs = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const playoffTeams = req.body.playoffTeams;
        console.log('Received start playoffs request with:', { leagueId, playoffTeams });
        await scheduleService.startPlayoffs(leagueId, playoffTeams);
        res.json({ message: 'Playoffs started successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to start playoffs' });
    }
}

exports.getPlayoffGames = async (req, res) => {
    try {

        console.log('Received get playoff games request with leagueId:', req.params.leagueId);
        const leagueId = req.params.leagueId;
        const playoffGames = await scheduleService.getPlayoffGames(leagueId);
        res.json(playoffGames);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch playoff games' });
    }
}

exports.completeRound = async (req, res) => {
    try {

        const leagueId = req.params.leagueId;
        const games = req.body.games;
        const nextGames = await scheduleService.completeRound(leagueId, games);
        res.json(nextGames);
    } catch (error) {
        res.status(500).json({ error: 'Failed to complete round' });
    }
}
