const tradesService = require('../services/trades.js');

exports.getTrades = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const userId = req.user.id; 
        const trades = await tradesService.getTrades(leagueId, userId);
        res.json(trades);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trades' });
    }
};

exports.getAllCharacters = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const characters = await tradesService.getAllCharacters(leagueId);
        res.json(characters);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch characters' });
    }
};

exports.getAllRosters = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const rosters = await tradesService.getAllRosters(leagueId);
        res.json(rosters);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rosters' });
    }
};

exports.getAllCharacterNames = async (req, res) => {
    try {
        const characterNames = await tradesService.getAllCharacterNames();
        res.json(characterNames);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch character names' });
    }
}

exports.createTrade = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const userId = req.user.id; 
        const tradeData = req.body;
        const newTrade = await tradesService.createTrade(leagueId, userId, tradeData);
        res.status(201).json(newTrade);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create trade' });
    }
}