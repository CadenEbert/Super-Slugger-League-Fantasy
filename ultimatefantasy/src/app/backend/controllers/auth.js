const authService = require('../services/auth.js');

exports.signUp = async (req, res) => {
    const { email, password, username } = req.body;
    try {
        const newUser = await authService.signUp(email, password, username);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await authService.signIn(email, password);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const userId = await authService.getMe(req, res);
        res.json({ user_id: userId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};