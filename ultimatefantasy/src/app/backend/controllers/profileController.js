const profileService = require('../services/profileService.js');


exports.getProfile = async (req, res) => {
    try {
        console.log('req.user:', req.user); // ← is user being set?
        const userId = req.user.id;
        console.log('userId:', userId);
        const profile = await profileService.getProfile(userId);
        console.log('profile result:', profile); // ← is profile null/undefined?
        res.json(profile);
    }
    catch (error) {
        console.error('getProfile error:', error); // ← what's actually throwing?
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};