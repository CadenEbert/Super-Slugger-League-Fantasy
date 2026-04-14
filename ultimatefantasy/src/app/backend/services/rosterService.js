const supabase = require('../supabase');

exports.getRoster = async (leagueId) => {
    const { data, error } = await supabase.client
        .from('rosters')
        .select(`
            id,
            team_name,
            owner_id
        `)
        .eq('league_id', leagueId);

    console.log('data:', JSON.stringify(data, null, 2));
    console.log('error:', error);

    if (error) throw new Error(error.message);

    return (data || []).map(roster => ({
        id: roster.id,
        teamName: roster.team_name,
        ownerId: roster.owner_id
    }));
};

exports.getRosterById = async (rosterId) => {
    const { data, error } = await supabase.client
        .from('roster_players')
        .select(`
        id,
        character_id,
        position,
        batting_order,
        characters:character_id (
            ID,
            character_name,
            pitching_arm,
            batting_arm,
            character_class,
            weight,
            captain,
            star_pitch
        )
    `)
        .eq('roster_id', rosterId);

    if (error) throw new Error(error.message);

    return (data || []).map(rp => ({
        playerId: rp.character_id,
        character_id: rp.character_id,
        position: rp.position,
        batting_order: rp.batting_order,
        character: rp.characters ? {
            id: rp.characters.id,
            characterName: rp.characters.character_name,
            pitchingArm: rp.characters.pitching_arm,
            battingArm: rp.characters.batting_arm,
            characterClass: rp.characters.character_class,
            weight: rp.characters.weight,
            captain: rp.characters.captain,
            starPitch: rp.characters.star_pitch
        } : null
        
    }));
};

exports.canCreateRoster = async (leagueId, userId) => {

    const { data, error } = await supabase.client
        .from('rosters')
        .select('id')
        .eq('league_id', leagueId)
        .eq('owner_id', userId)
        .maybeSingle();



    if (error) throw new Error(error.message);

    return !data;
}

exports.createRoster = async (leagueId, userId, teamName) => {
    const { data, error } = await supabase.client
        .from('rosters')
        .insert({
            league_id: leagueId,
            team_name: teamName,
            owner_id: userId

        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return {
        id: data.id,
        teamName: data.team_name,
        ownerId: data.owner_id,
        players: []
    };
}