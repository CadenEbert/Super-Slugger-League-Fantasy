const supabase = require('../supabase.js');

exports.getFreeAgents = async (leagueId) => {
    const { data: allPlayers, error: playersError } = await supabase.client
        .from('characters')
        .select('*');

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

    const freeAgents = allPlayers.filter(
        player => !rosteredIds.has(player.ID)
    );

    console.log('rosteredIds:', [...rosteredIds]);
console.log('sample player ID:', allPlayers[0]?.ID, typeof allPlayers[0]?.ID);

    return freeAgents.map(player => ({
        id: player.ID,
        characterName: player.character_name,
        character_image: player.character_image,
        weight: player.weight,
        captain: player.captain,
        bunting: player.bunting,
        speed: player.speed,
        fielding: player.fielding,
        curve: player.curve,
        trajectory: player.traj,
        stamina: player.stamina,
        pitchingArm: player.pitching_arm,
        battingArm: player.batting_arm,
        characterClass: player.character_class,
        starPitch: player.star_pitch,
        fieldingAbility: player.fielding_ability,
        starSwing: player.star_swing,
        baserunningAbility: player.baserunning_ability,
        slapSize: player.slap_size,
        chargeSize: player.charge_size,
        slapPower: player.slap_power,
        chargePower: player.charge_power,
        outfieldThrowing: player.outfield_throwing,
        displayedPitching: player.displayed_pitching,
        displayedBatting: player.displayed_batting,
        displayedFielding: player.displayed_fielding,
        displayedSpeed: player.dis_speed,
        curveball_speed: player.curveball_speed,
        chargePitchSpeed: player.charge_pitch_speed,
        hitCurve: player.hit_curve,
        starPitchType: player.star_pitch_type
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