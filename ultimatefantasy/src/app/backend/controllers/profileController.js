const profileService = require('../services/profileService.js');


exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await profileService.getProfile(userId);
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

exports.changeUsername = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username } = req.body;
        const updatedProfile = await profileService.changeUsername(userId, username);
        res.json(updatedProfile);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update username' });
    }
}