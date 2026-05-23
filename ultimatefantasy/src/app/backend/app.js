const path = require('path');
const express = require('express');
const app = express();
app.use(express.static(path.join(process.cwd(), 'dist/ultimatefantasy/browser')));
const authMiddleware = require('./middleware/auth.js');




app.use(express.json());


app.use('/api', require('./routes/league')); 
app.use('/api', require('./routes/rosters'));
app.use('/api', require('./routes/profile'));
app.use('/api', require('./routes/freeagents'));
app.use('/api', require('./routes/draft'));
app.use('/api', require('./routes/schedule'));
app.use('/api', require('./routes/playerstats'));
app.use('/api', require('./routes/trades'));
app.use('/api', require('./routes/auth.js'));

module.exports = app;