const draftService = require('../services/draft.js');

exports.getDraftState = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const draftState = await draftService.getDraftState(leagueId);
        res.json(draftState);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch draft state' });
    }
};