const rosterService = require('../services/rosterService');

exports.getRoster = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const roster = await rosterService.getRoster(leagueId);
        res.json(roster);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch roster' });
    }
}

exports.canCreateRoster = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const userId = req.query.userId;
        const canCreate = await rosterService.canCreateRoster(leagueId, userId);
        res.json({ canCreate });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check roster creation' });
    }
}

exports.createRoster = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const userId = req.user.id; 
        const teamName = req.body.teamName;
        const newRoster = await rosterService.createRoster(leagueId, userId, teamName);
        res.status(201).json(newRoster);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create roster' });
    }

}