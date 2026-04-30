const supabase = require('../supabase');

exports.getRoster = async (leagueId) => {
    const { data, error } = await supabase.client
        .from('rosters')
        .select(`
            id,
            team_name,
            owner_id,
            owner_username,
            team_image
        `)
        .eq('league_id', leagueId);

    console.log('data:', JSON.stringify(data, null, 2));
    console.log('error:', error);

    if (error) throw new Error(error.message);

    return (data || []).map(roster => ({
        id: roster.id,
        teamName: roster.team_name,
        ownerId: roster.owner_id,
        owner_username: roster.owner_username,
        team_image: roster.team_image
    }));
};

exports.getOwnerId = async (rosterId) => {
    const { data, error } = await supabase.client
        .from('rosters')
        .select('owner_id')
        .eq('id', rosterId)
        .single();

    if (error) throw new Error(error.message);

    return data.owner_id;
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
            weight, captain,
            bunting,
            speed,
            fielding,
            curve,
            traj,
            stamina,
            pitching_arm,
            batting_arm,
            character_class,
            star_pitch,
            fielding_ability,
            star_swing,
            baserunning_ability,
            slap_size,
            charge_size,
            slap_power,
            charge_power,
            outfield_throwing,
            displayed_pitching,
            displayed_batting,
            displayed_fielding,
            dis_speed, 
            curveball_speed,
            charge_pitch_speed,
            hit_curve,
            star_pitch_type
        )
    `)
        .eq('roster_id', rosterId);
    if (error) throw new Error(error.message);

    return (data || []).map(player => ({
        playerId: player.character_id,
        character_id: player.character_id,
        position: player.position,
        batting_order: player.batting_order,
        character: player.characters ? {
            id: player.characters.ID,
            characterName: player.characters.character_name,
            weight: player.characters.weight,
            captain: player.characters.captain,
            bunting: player.characters.bunting,
            speed: player.characters.speed,
            fielding: player.characters.fielding,
            curve: player.characters.curve,
            trajectory: player.characters.traj,
            stamina: player.characters.stamina,
            pitchingArm: player.characters.pitching_arm,
            battingArm: player.characters.batting_arm,
            characterClass: player.characters.character_class,
            starPitch: player.characters.star_pitch,
            fieldingAbility: player.characters.fielding_ability,
            starSwing: player.characters.star_swing,
            baserunningAbility: player.characters.baserunning_ability,
            slapSize: player.characters.slap_size,
            chargeSize: player.characters.charge_size,
            slapPower: player.characters.slap_power,
            chargePower: player.characters.charge_power,
            outfieldThrowing: player.characters.outfield_throwing,
            displayedPitching: player.characters.displayed_pitching,
            displayedBatting: player.characters.displayed_batting,
            displayedFielding: player.characters.displayed_fielding,
            displayedSpeed: player.characters.dis_speed,
            curveball_speed: player.characters.curveball_speed,
            chargePitchSpeed: player.characters.charge_pitch_speed,
            hitCurve: player.characters.hit_curve,
            starPitchType: player.characters.star_pitch_type
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

exports.createRoster = async (leagueId, userId, teamName, teamImage, userName) => {
    console.log('Creating roster with:', { leagueId, userId, teamName, userName });
    const { data, error } = await supabase.client
        .from('rosters')
        .insert({
            league_id: leagueId,
            team_name: teamName,
            team_image: teamImage,
            owner_id: userId,
            owner_username: userName || 'Unknown User'
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return {
        id: data.id,
        teamName: data.team_name,
        ownerId: data.owner_id,
        owner_username: data.owner_username,
        players: []
    };
}

exports.changePlayerPosition = async (rosterId, characterId, newPosition) => {



    const { data, error } = await supabase.client
        .from('roster_players')
        .update({ position: newPosition })
        .eq('roster_id', rosterId)
        .eq('character_id', characterId)
        .select()
        .single();



    console.log('changePlayerPosition - data:', JSON.stringify(data, null, 2));
    console.log('changePlayerPosition - error:', error);

    if (error) throw new Error(error.message);

    return {
        rosterId,
        characterId,
        newPosition: data.position
    };

    
}

exports.changePlayerBattingOrder = async (rosterId, characterId, newBattingOrder) => {
    newBattingOrder = newBattingOrder;
    const { data, error } = await supabase.client
        .from('roster_players')
        .update({ batting_order: newBattingOrder })
        .eq('roster_id', rosterId)
        .eq('character_id', characterId)
        .select()
        .single();

    if (error) throw new Error(error.message);

    return {
        rosterId,
        characterId,
        newBattingOrder: data.batting_order
    };
}


exports.removePlayer = async (rosterId, characterId) => {

    

        const { data, error } = await supabase.client
    .from('roster_players')
    .delete()
    .eq('roster_id', rosterId)
    .eq('character_id', characterId)
    .select();

    if (error) throw new Error(error.message);

        return {
            rosterId,
            characterId
        };
}

