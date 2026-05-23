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

exports.getRosterById = async (req, res) => {
    try {
        const rosterId = req.params.rosterId;
        const roster = await rosterService.getRosterById(rosterId);
        res.json(roster);
    }
    catch (error) {
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
        console.error('canCreateRoster error:', error.message);
    }
}

exports.createRoster = async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        const userId = req.user.id; 
        const teamName = req.body.teamName;
        const teamImage = req.body.teamImage;
        const userName = req.body.userName || 'Unknown User';
        console.log('Received create roster request with:', { leagueId, userId, teamName, userName });
        const newRoster = await rosterService.createRoster(leagueId, userId, teamName, teamImage, userName);
        res.status(201).json(newRoster);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create roster' });
    }

}

exports.getOwnerId = async (req, res) => {
    try {
        const rosterId = req.params.rosterId;
        const ownerId = await rosterService.getOwnerId(rosterId);
        res.json({ ownerId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch owner ID' });
    }
}


exports.savePlayer = async (req, res) => {
    try {
        const rosterId = req.params.rosterId;
        const characterId = req.params.characterId;
        const savePlayer= req.body.player;
        const updatedPlayer = await rosterService.savePlayer(rosterId, characterId, savePlayer);
        res.json(updatedPlayer);

    } catch (error) {
        res.status(500).json({ error: 'Failed to change player position' });
    }
}

exports.removePlayer = async (req, res) => {
    try {
        const rosterId = req.params.rosterId;
        const characterId = req.params.characterId;
        await rosterService.removePlayer(rosterId, characterId);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to remove player' });
    }
}

exports.getRosterForUpdate = async (req, res) => {
    try {
        const rosterId = req.params.rosterId;
        const roster = await rosterService.getRosterForUpdate(rosterId);
        res.json(roster);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch roster for update' });
    }
}


exports.updateRosterDetails = async (req, res) => {
    try {
        const rosterId = req.params.rosterId;
        const { teamName, teamImage } = req.body;
        const updatedRoster = await rosterService.updateRosterDetails(rosterId, teamName, teamImage);
        res.json(updatedRoster);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update roster details' });
    }
}