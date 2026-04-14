const supabase = require('../supabase.js');

exports.getFreeAgents = async (leagueId) => {
    const { data: allPlayers, error: playersError } = await supabase.client
        .from('characters')
        .select('ID, character_name, pitching_arm, batting_arm, character_class, weight, captain, star_pitch');

    console.log('All players:', allPlayers);

    if (playersError) throw new Error(playersError.message);

    const { data: rosterPlayers, error: rosterError } = await supabase.client
        .from('roster_players')
        .select('character_id, rosters!roster_players_roster_id_fkey(league_id)')
        .eq('rosters.league_id', leagueId);


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