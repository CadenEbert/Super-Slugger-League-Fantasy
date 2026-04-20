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
        const number_of_playoff = req.body.number_of_playoff;
        const number_of_matchups = req.body.number_of_matchups;
        const schedule = await scheduleService.generateSchedule(leagueId, number_of_playoff, number_of_matchups);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate schedule' });
    }
}