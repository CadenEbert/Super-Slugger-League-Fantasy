const { get } = require('node:http');
const supabase = require('../supabase.js');

exports.getDraftState = async (leagueId) => {
    console.log('Fetching draft state for leagueId:', leagueId);


  const { data, error } = await supabase.client
    .from('draft')
    .select('uuid, league_id, status, current_pick, current_round, number_of_players, draft_type, timer_seconds, timer_ends_at')
    .eq('league_id', leagueId)
    .single();

    if (error) throw new Error(error.message);

    console.log('Draft state data from database:', data);

    return data;
};