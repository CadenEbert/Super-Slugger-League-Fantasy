
const express = require('express');
const router = express.Router();

// Example GET endpoint for /api/rosters
router.get('/rosters', (req, res) => {
  // Your logic here
  res.json({ message: 'List of rosters' });
});

module.exports = router;