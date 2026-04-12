// Backend Supabase client for Node.js
const { createClient } = require('@supabase/supabase-js');

// Use environment variables for security
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
}

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

module.exports = { client };