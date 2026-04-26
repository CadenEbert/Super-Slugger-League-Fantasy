const express = require('express');
const app = express();
const authMiddleware = require('./middleware/auth.js');





app.use(express.json());

app.use('/api', authMiddleware);
app.use('/api', require('./routes/league')); 
app.use('/api', require('./routes/rosters'));
app.use('/api', require('./routes/profile'));
app.use('/api', require('./routes/freeagents'));
app.use('/api', require('./routes/draft'));
app.use('/api', require('./routes/schedule'));
app.use('/api', require('./routes/playerstats'));

module.exports = app;