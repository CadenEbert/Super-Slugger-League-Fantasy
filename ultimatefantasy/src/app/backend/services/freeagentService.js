const supabase = require('../supabase.js');

exports.getFreeAgents = async (leagueId) => {
    const { data: allPlayers, error: playersError } = await supabase.client
        .from('characters')
        .select('ID, character_name, pitching_arm, batting_arm, character_class, weight, captain, star_pitch');

    if (playersError) throw new Error(playersError.message);

    // First get roster IDs that belong to this league
    const { data: leagueRosters, error: rostersError } = await supabase.client
        .from('rosters')
        .select('id')
        .eq('league_id', leagueId);

    if (rostersError) throw new Error(rostersError.message);

    const leagueRosterIds = leagueRosters.map(r => r.id);

    const { data: rosterPlayers, error: rosterError } = await supabase.client
        .from('roster_players')
        .select('character_id')
        .in('roster_id', leagueRosterIds);

    if (rosterError) throw new Error(rosterError.message);

    const rosteredIds = new Set(rosterPlayers.map(r => r.character_id));

    const freeAgents = allPlayers.filter(c => !rosteredIds.has(c.ID));

    return freeAgents.map(p => ({
        id: p.ID,
        characterName: p.character_name,
        pitchingArm: p.pitching_arm,
        battingArm: p.batting_arm,
        characterClass: p.character_class,
        weight: p.weight,
        captain: p.captain,
        starPitch: p.star_pitch
    }));
};

exports.addPlayerToRoster = async (leagueId, rosterId, characterId) => {
    const { data, error } = await supabase.client
        .from('roster_players')
        .insert({
            roster_id: rosterId,
            character_id: characterId,
            position: 'Bench',
            batting_order: null
        })
        .select()
        .single();

        

        if (error) throw new Error(error.message);
        return {
            playerId: data.character_id,
            position: data.position,
            batting_order: data.batting_order
        };
};