const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
}

const decoded = jwt.decode(SUPABASE_SERVICE_KEY);

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

function setupDraftChannel(io) {
  client
    .channel('draft-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'draft' },
      (payload) => {
        console.log('Draft table change:', payload);
        io.emit('draftUpdate', payload);
      }
    )
    .subscribe();
}

module.exports = { client, setupDraftChannel };