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

const activeChannels = new Map();

function setupDraftChannel(io, draftId) {
  const id = typeof draftId === 'object' && draftId.uuid ? draftId.uuid : draftId;

  if (activeChannels.has(id)) return;

  const channel = client
    .channel(`draft-changes-${id}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'draft', filter: `uuid=eq.${id}` }, 
      (payload) => {
        console.log(`Draft row ${id} change:`, payload);
        io.to(`draft_${id}`).emit(`draftUpdate:${id}`, payload);
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'draft_players', filter: `draft_id=eq.${id}` }, 
      (payload) => {
        console.log(`Draft players change for ${id}:`, payload);
        io.to(`draft_${id}`).emit(`draftPlayersUpdate:${id}`, payload);
      }
    )

    .subscribe((status) => {
      console.log(`Channel status for ${id}:`, status);
    });

  activeChannels.set(id, channel);
}

module.exports = { client, setupDraftChannel };