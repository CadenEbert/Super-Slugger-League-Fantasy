const jwt = require('jsonwebtoken');
const { client: supabase } = require('../supabase.js'); 

async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];


  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  req.user = user; 
  next();
  
} 

module.exports = authMiddleware;