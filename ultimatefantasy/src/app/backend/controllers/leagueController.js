exports.getLeagues = async (req, res) => {
    try {
        const userId = req.user.id; // Make sure authentication middleware sets req.user
        const leagues = await leagueService.getLeaguesForUser(userId);
        res.json(leagues);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leagues' });
    }   
};

exports.createLeague = async (req, res) => {
    try {
        const userId = req.user.id;
        const leagueData = req.body;
        const newLeague = await leagueService.createLeague(userId, leagueData);
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