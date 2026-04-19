const draftService = require('../services/draft.js');
const { getAllPlayers } = require('../services/draft');

exports.getDraftState = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const draftState = await draftService.getDraftState(leagueId);
        res.json(draftState);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch draft state' });
    }
};

exports.joinDraftChannel = async (req, res) => {
    try {
        const draftId = req.params.draftId;
        const userId = req.user.id; 
        const success = await draftService.joinDraftChannel(draftId, userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to join draft channel' });
    }
};

exports.getDraftIdByLeagueId = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const draftId = await draftService.getDraftIdByLeagueId(leagueId);
        res.json({ draftId });

    }   catch (error) {
        res.status(500).json({ error: 'Failed to fetch draft ID' });
    }
};

exports.getAllLeagueMembers = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const members = await draftService.getAllLeagueMembers(leagueId);
        res.json({ members });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch league members' });
    }
};

exports.updateDraftData = async (req, res) => {
    try {
        console.log('Received request to update draft data with body:', req.body);
        const draftId = req.params.draftId;
        const data = req.body;
        await draftService.updateDraftData(draftId, data);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update draft data' });
    }
};

exports.getDraftPlayers = async (req, res) => {
    try {
        const draftId = req.params.draftId;
        const players = await draftService.getDraftPlayers(draftId);
        res.json({ players });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch draft players' });
    }
};

exports.pauseDraftTimer = async (req, res) => {
  try {
    const draftId = req.params.draftId;
    await draftService.pauseDraftTimer(draftId);
    res.json({ success: true });
  } catch (error) {    res.status(500).json({ error: 'Failed to pause draft timer' });
}
};

exports.startDraftTimer = async (req, res) => {
  try {
    const draftId = req.params.draftId;
    const timerSeconds = req.body.timerSeconds;
    await draftService.startDraftTimer(draftId, timerSeconds);
    res.json({ success: true });
  }
    catch (error) {
    res.status(500).json({ error: 'Failed to start draft timer' });
    }
};

exports.getPlayerPool = async (req, res) => {
  try {
    const draftId = req.params.draftId;
    const playerPool = await draftService.getPlayerPool(draftId);
    res.json({ playerPool });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player pool' });
  }
};

exports.getAllPlayers = async (req, res) => {
    try {
        const players = await getAllPlayers();
        res.json({ players });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all players' });
    }
};

exports.makeDraftPick = async (req, res) => {
    try {
        const draftId = req.params.draftId;
        const { characterId, memberPicking} = req.body;
        await draftService.makeDraftPick(draftId, characterId, memberPicking);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to make draft pick' });
    }
};

exports.getDraftStatus = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const draftStatus = await draftService.getDraftStatus(leagueId);
        res.json({ draftStatus });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch draft status' });
    }
};

exports.getCanDraft = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const userId = req.user.id;
        const canDraft = await draftService.getCanDraft(leagueId);
        res.json({ canDraft });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check if user can draft' });
    }
};