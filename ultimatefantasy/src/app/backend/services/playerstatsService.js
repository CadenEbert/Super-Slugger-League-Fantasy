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




    