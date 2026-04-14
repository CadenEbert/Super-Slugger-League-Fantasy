const freeagentService = require('../services/freeagentService.js');



exports.getFreeAgents = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        console.log('Fetching free agents for leagueId:', leagueId);
        const freeAgents = await freeagentService.getFreeAgents(leagueId);
        res.json(freeAgents);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch free agents' });
    }

};