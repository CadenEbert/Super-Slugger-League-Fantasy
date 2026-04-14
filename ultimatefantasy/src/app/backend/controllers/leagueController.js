const leagueService = require('../services/leagueService');

exports.getLeagues = async (req, res) => {
    try {
        const userId = req.user.id; 
        console.log('userId:', userId);
        console.log('req.user:', req.user);
        const leagues = await leagueService.getLeaguesForUser(userId);
        res.json(leagues);
    } catch (error) {
        console.error('getLeagues error:', error); 
        res.status(500).json({ error: 'Failed to fetch leagues' });
    }   
};

exports.createLeague = async (req, res) => {
    try {
        const userId = req.user.id;
        const leagueData = req.body;
        const userName = req.user.name || 'Unknown User';
        const newLeague = await leagueService.createLeague(userId, leagueData, userName);
        res.status(201).json(newLeague);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create league' });
    }
};

exports.getLeagueById = async (req, res) => {
    try {
        const leagueId = req.params.id;
        const league = await leagueService.fetchLeagueDetails(leagueId);
        if (league) {
            res.json(league);
        } else {
            res.status(404).json({ error: 'League not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch league' });
    }
};

exports.updateLeague = async (req, res) => {
    try {
        const leagueId = req.params.id;
        const leagueData = req.body;
        const updatedLeague = await leagueService.updateLeague(leagueId, leagueData);
        if (updatedLeague) {
            res.json(updatedLeague);
        } else {
            res.status(404).json({ error: 'League not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update league' });
    }
};

exports.getUsersRosterId = async (req, res) => {
    try {
        const leagueId = req.params.id;
        const userId = req.params.userId;
        const rosterId = await leagueService.getUsersRosterId(leagueId, userId);
        if (rosterId) {
            res.json({ rosterId });
        }
        else {
            res.status(404).json({ error: 'Roster not found for user in this league' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user roster ID' });
    }

}