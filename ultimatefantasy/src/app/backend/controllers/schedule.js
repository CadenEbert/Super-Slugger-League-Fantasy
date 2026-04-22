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