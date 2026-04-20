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
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate schedule' });
    }
}