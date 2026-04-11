

const express = require('express');
const app = express();
const rostersRoutes = require('./routes/rosters');


app.use(express.json());
app.use('/api', rostersRoutes);

rostersRoutes.get('/api/rosters', (req, res) => {

  
});

module.exports = app;