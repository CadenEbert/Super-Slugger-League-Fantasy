const supabase = require('../supabase'); 


exports.getPlayerStats = async (leagueId) => {
  

    const { data, error } = await supabase.client
        .from('player_stats')
        .select('*')
        .eq('league_id', leagueId);

    if (error) throw new Error(error.message);

    
    return data;
}


exports.addPlayerStats = async (leagueId, character, user_id) => {
    console.log('Adding player stats with:', { leagueId, character, user_id });
    const { data, error } = await supabase.client
        .from('player_stats')
        .insert({
            league_id: leagueId,
            character_id: character.ID,
            character_name: character.character_name,
            user_id: user_id
            
        })
        .select()
        .single();
    console.log('Supabase response:', { data, error });
    if (error) throw new Error(error.message);
    return data;
}

exports.updatePlayerStats = async (leagueId, user_id, stats) => {
    console.log('Updating player stats with:', { leagueId, user_id, stats });
    const results = [];
    for (const stat of stats) {
        const { data, error } = await supabase.client
            .from('player_stats')
            .update({
                character_name: stat.character_name,
                hits: stat.hits,
                hr: stat.hr,
                ab: stat.ab,
                innings: stat.innings,
                outs: stat.outs,
                runs_allowed: stat.runs_allowed,
                total_points: stat.total_points
            })
            .eq('league_id', leagueId)
            .eq('user_id', user_id)
            .eq('character_id', stat.character_id)
            .select()
            .maybeSingle();
        if (error) throw new Error(error.message);
        results.push(data);
    }
    return results;
};

exports.deletePlayerStats = async (leagueId, characterId, user_id) => {
    console.log('Deleting player stats with:', { leagueId, characterId, user_id });
    const { data, error } = await supabase.client
        .from('player_stats')
        .delete()
        .eq('league_id', leagueId)
        .eq('user_id', user_id)
        .eq('character_id', parseInt(characterId))
        .select();

    if (error) throw new Error(error.message);
    return data;
}

exports.getFilteredCharacters = async (leagueId, user_id) => {
    const { data, error } = await supabase.client
        .from('player_stats')
        .select('character_id')
        .eq('league_id', leagueId)
        .eq('user_id', user_id);

    if (error) throw new Error(error.message);

    const { data: characters, error: charError } = await supabase.client
        .from('characters')
        .select('ID, character_name');

    if (charError) throw new Error(charError.message);

    const filteredCharacterIds = data.map(stat => stat.character_id);

    return characters.filter(char => !filteredCharacterIds.includes(char.ID));
}




    