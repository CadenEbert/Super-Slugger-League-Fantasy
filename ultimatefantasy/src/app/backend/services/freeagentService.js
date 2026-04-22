const supabase = require('../supabase.js');

exports.getFreeAgents = async (leagueId) => {
    const { data: allPlayers, error: playersError } = await supabase.client
        .from('characters')
        .select('ID, character_name, pitching_arm, batting_arm, character_class, weight, captain, star_pitch');

    if (playersError) throw new Error(playersError.message);

  
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

    const { data: player, error: playerError } = await supabase.client
        .from('roster_players')
        .select()
        .eq('league_id', leagueId)
        .eq('character_id', characterId);

    if (playerError) {
        console.error('Error checking existing player:', playerError);
    } else if (player && player.length > 0) {
        return { exists: true, message: 'Player is already on the roster' };
        
    }

    const { data: roster, error: rosterError } = await supabase.client
        .from('roster_players')
        .select('*')
        .eq('league_id', leagueId)
        .eq('roster_id', rosterId);

    if (rosterError) {
        console.error('Error fetching roster players:', rosterError);
        throw new Error('Failed to fetch roster players');
    }

    const { data: league, error: leagueError } = await supabase.client
        .from('leagues')
        .select('roster_size')
        .eq('id', leagueId)
        .single();

    if (leagueError) {
        console.error('Error fetching league info:', leagueError);
        throw new Error('Failed to fetch league information');
    }

    if (roster.length >= league.roster_size) {
        return { full: true, message: 'Roster is already at maximum capacity' };
    }

    const { data, error } = await supabase.client
        .from('roster_players')
        .insert({
            roster_id: rosterId,
            character_id: characterId,
            position: 'Bench',
            batting_order: null,
            league_id: leagueId
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