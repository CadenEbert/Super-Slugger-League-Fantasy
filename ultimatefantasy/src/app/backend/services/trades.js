const supabase = require('../supabase'); 


exports.getTrades = async (leagueId, userId) => {
    console.log(`Fetching trades for leagueId: ${leagueId} and userId: ${userId}`);
    const { data, error } = await supabase.client
        .from('trades')
        .select('*')
        .eq('league_id', leagueId)
        .eq('recieving_team_id', userId);

    if (error) throw new Error(error.message);

    return data;
}


exports.getAllCharacters = async (leagueId) => {
    console.log('Fetching all characters for trades');
    const { data, error } = await supabase.client
        .from('roster_players')
        .select('character_id, roster_id')
        .eq('league_id', leagueId);

    if (error) throw new Error(error.message);

    return data;
}

exports.getAllRosters = async (leagueId) => {
    console.log('Fetching all rosters for trades');
    const { data, error } = await supabase.client
        .from('rosters')
        .select('id, team_name, owner_id')
        .eq('league_id', leagueId);

    if (error) throw new Error(error.message);

    return data;
}

