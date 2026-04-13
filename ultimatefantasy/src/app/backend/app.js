const express = require('express');
const app = express();


app.use(express.json());
app.use('/api', require('./routes/league')); 
app.use('/api', require('./routes/rosters'));

module.exports = app;