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