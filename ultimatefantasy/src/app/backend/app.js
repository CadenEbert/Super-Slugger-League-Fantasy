const express = require('express');
const app = express();


app.use(express.json());
app.use('/api', require('./routes/league')); 
app.use('/api', require('./routes/rosters'));
app.use('/api', require('./routes/profile'));
app.use('/api', require('./routes/freeagents'));
app.use('/api', require('./routes/draft'));

module.exports = app;