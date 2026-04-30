const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
}

const decoded = jwt.decode(SUPABASE_SERVICE_KEY);

const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const activeChannels = new Map();

function setUpScheduleChannel(io, leagueId) {

  if (activeChannels.has(leagueId)) return;

  const channel = client
    .channel(`schedule-changes-${leagueId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'schedule_games', filter: `league_id=eq.${leagueId}` },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          io.to(`schedule_${leagueId}`).emit(`scheduleUpdate:${leagueId}`, { deleted: true, id: payload.old.id });
        } else {
          io.to(`schedule_${leagueId}`).emit(`scheduleUpdate:${leagueId}`, payload.new); 
        }
      }
    ).on('postgres_changes',
      { event: '*', schema: 'public', table: 'schedule', filter: `league_id=eq.${leagueId}` },
      (payload) => {
        console.log(`Schedule metadata change for league ${leagueId}:`, payload);
        io.to(`schedule_${leagueId}`).emit(`scheduleMetadataUpdate:${leagueId}`, payload.new);
      }
    )
    .subscribe((status) => {
      console.log(`Channel status for ${leagueId}:`, status);
    });

  activeChannels.set(leagueId, channel);
}


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

module.exports = { client, authClient, setupDraftChannel, setUpScheduleChannel };