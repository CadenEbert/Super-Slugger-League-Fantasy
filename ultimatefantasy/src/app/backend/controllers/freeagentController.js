const freeagentService = require('../services/freeagentService.js');



exports.getFreeAgents = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const freeAgents = await freeagentService.getFreeAgents(leagueId);
        res.json(freeAgents);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch free agents' });
    }

};

exports.addPlayerToRoster = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const rosterId = req.params.rosterId;
        const characterId = req.params.characterId;
        const result = await freeagentService.addPlayerToRoster(leagueId, rosterId, characterId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add player to roster' });
    }
};