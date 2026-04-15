const { client, setupDraftChannel } = require('../supabase.js');



exports.getDraftState = async (leagueId) => {
    console.log('Fetching draft state for leagueId:', leagueId);


  const { data, error } = await client
    .from('draft')
    .select('uuid, league_id, status, current_pick, current_round, number_of_players, draft_type, timer_seconds, timer_ends_at')
    .eq('league_id', leagueId)
    .single();

    if (error) throw new Error(error.message);

    console.log('Draft state data from database:', data);

    return data;
};

exports.joinDraftChannel = async (draftId, userId, io) => {
  console.log(`User ${userId} joining draft channel for draftId: ${draftId}`);
  setupDraftChannel(io, draftId); 
  return true;
};


exports.getDraftIdByLeagueId = async (leagueId) => {
  console.log('Fetching draft ID for leagueId:', leagueId);

  try {
    const { data, error } = await client
      .from('draft')
      .select('uuid')
      .eq('league_id', leagueId)
      .single();

    

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }

    if (!data) {
      console.warn('No draft found for leagueId:', leagueId);
      return null;
    }

    return data.uuid;
  } catch (err) {
    console.error('Caught exception:', err);
    throw err;
  }
};


