const supabase = require('../supabase'); 


exports.getTrades = async (leagueId, userId) => {
    console.log(`Fetching trades for leagueId: ${leagueId} and userId: ${userId}`);
    const { data, error } = await supabase.client
        .from('trades')
        .select('*')
        .eq('league_id', leagueId)
        .eq('receiving_team_id', userId);

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

exports.getAllCharacterNames = async () => {
    const { data, error } = await supabase.client
        .from('characters')
        .select('ID, character_name');


        if (error) throw new Error(error.message);

    return data;
}

exports.createTrade = async (leagueId, userId, tradeData) => {
    console.log('Creating trade with data:', { leagueId, userId, tradeData });
    const { data, error } = await supabase.client
        .from('trades')
        .insert({
            league_id: leagueId,
            receiving_team_id: userId,
            receiving_team_username: tradeData.receivingTeamUsername,
            proposing_team_username: tradeData.proposingTeamUsername,
            proposing_team_id: tradeData.proposingTeamId,
            offered_player_id: tradeData.offeredPlayerId,
            offered_player_name: tradeData.offeredPlayerName,
            requested_player_id: tradeData.requestedPlayerId,
            requested_player_name: tradeData.requestedPlayerName,
            status: 'pending'
        })
        .select()
        .single();
    if (error) throw new Error(error.message);

    return data;
}

