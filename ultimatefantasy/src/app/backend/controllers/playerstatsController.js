
const playerstatsService = require('../services/playerstatsService.js');


exports.getPlayerStats = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const stats = await playerstatsService.getPlayerStats(leagueId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch player stats' });
    }
}

exports.addPlayerStats = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const characterId = req.body.characterId;
        const user_id = req.user.id;
        const stats = req.body.stats;
        const newStats = await playerstatsService.addPlayerStats(leagueId, characterId, user_id, stats);
        res.status(201).json(newStats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add player stats' });
    }
}


exports.updatePlayerStats = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const characterId = req.body.characterId;
        const user_id = req.user.id;
        const stats = req.body.stats;
        const updatedStats = await playerstatsService.updatePlayerStats(leagueId, characterId, user_id, stats);
        res.json(updatedStats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update player stats' });
    }
}

exports.deletePlayerStats = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const characterId = req.body.characterId;
        const user_id = req.user.id;
        await playerstatsService.deletePlayerStats(leagueId, characterId, user_id);
        res.json({ message: 'Player stats deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete player stats' });
    }
}
