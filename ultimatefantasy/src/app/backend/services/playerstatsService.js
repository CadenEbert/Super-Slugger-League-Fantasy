const supabase = require('../supabase'); 


exports.getPlayerStats = async (leagueId) => {
    const { data, error } = await supabase.client
        .from('player_stats')
        .select('*')
        .eq('league_id', leagueId);

    if (error) throw new Error(error.message);
    return data;
}


exports.addPlayerStats = async (leagueId, characterId, user_id, stats) => {
    const { data, error } = await supabase.client
        .from('player_stats')
        .insert({
            league_id: leagueId,
            character_id: characterId,
            user_id: user_id,
            stats: stats
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

exports.updatePlayerStats = async (leagueId, characterId, user_id, stats) => {
    const { data, error } = await supabase.client
        .from('player_stats')
        .update({ stats: stats })
        .eq('league_id', leagueId)
        .eq('user_id', user_id)
        .eq('character_id', characterId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

exports.deletePlayerStats = async (leagueId, characterId, user_id) => {
    const { data, error } = await supabase.client
        .from('player_stats')
        .delete()
        .eq('league_id', leagueId)
        .eq('user_id', user_id)
        .eq('character_id', characterId)
        .select();

    if (error) throw new Error(error.message);
    return data;
}




    