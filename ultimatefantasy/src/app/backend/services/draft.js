const { client, setupDraftChannel } = require('../supabase.js');

const io = require('../../../../server.js').io;

const activeTimers = {};



exports.getDraftState = async (leagueId) => {
    console.log('Fetching draft state for leagueId:', leagueId);


  const { data, error } = await client
    .from('draft')
    .select('uuid, league_id, status, current_pick, current_round, number_of_players, draft_type, timer_seconds,  number_of_rounds, time_per_pick, pick_order, current_pick_index, timer_running, player_pool')
    .eq('league_id', leagueId)
    .single();

    if (error) throw new Error(error.message);

    console.log('Draft state data from database:', data);

    return data;
};

exports.joinDraftChannel = async (draftId, userId, io) => {
  console.log(`User ${userId} joining draft channel for draftId: ${draftId}`);
  setupDraftChannel(io, draftId); 
  return true;
};


exports.getDraftIdByLeagueId = async (leagueId) => {
  console.log('Fetching draft ID for leagueId:', leagueId);

  try {
    const { data, error } = await client
      .from('draft')
      .select('uuid')
      .eq('league_id', leagueId)
      .single();

    

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }

    if (!data) {
      console.warn('No draft found for leagueId:', leagueId);
      return null;
    }

    return data.uuid;
  } catch (err) {
    console.error('Caught exception:', err);
    throw err;
  }
};


exports.getAllLeagueMembers = async (leagueId) => {
  console.log('Fetching league members for leagueId:', leagueId);

  const { data, error } = await client
    .from('league_members')
    .select('user_id, profiles(username)')
    .eq('league_id', leagueId);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message);
  }


  const members = data.map(member => ({
    user_id: member.user_id,
    username: member.profiles?.username || null
  }));

  return members;
};

exports.updateDraftData = async (draftId, data) => {
  console.log(`Updating draft data for draftId: ${draftId} with data:`, data);
  const { error } = await client
    .from('draft')
    .update(data)
    .eq('uuid', draftId);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message);
  }
  return true;
};

exports.getDraftPlayers = async (draftId) => {
  console.log(`Fetching draft players for draftId: ${draftId}`);
  const { data, error } = await client
    .from('draft_players')
    .select('id, draft_id, character_picked, member_picking, league_id, pick_number')
    .eq('draft_id', draftId);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message);
  }
  return data;
};


exports.pauseDraftTimer = async (draftId) => {
  try {
    const { error } = await client
      .from('draft')
      .update({ timer_running: false })
      .eq('uuid', draftId);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }
    return true;
  } catch (err) {
    console.error('Caught exception:', err);
    throw err;
  }
};

exports.startDraftTimer = async (draftId, timerSeconds) => {
  try {
    const { error } = await client
      .from('draft')
      .update({ timer_running: true, timer_seconds: timerSeconds })
      .eq('uuid', draftId);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }

    if (activeTimers[draftId]) clearInterval(activeTimers[draftId]);

    activeTimers[draftId] = setInterval(async () => {
      const { data } = await client
        .from('draft')
        .select('timer_seconds, timer_running')
        .eq('uuid', draftId)
        .single();

      if (!data || !data.timer_running) {
        clearInterval(activeTimers[draftId]);
        return;
      }

      let newSeconds = data.timer_seconds - 1;

      await client
        .from('draft')
        .update({ timer_seconds: newSeconds })
        .eq('uuid', draftId);

      
      if (io) {
        io.to(`draft_${draftId}`).emit('timer_update', { timer_seconds: newSeconds });
      }

      if (newSeconds <= 0) {
        clearInterval(activeTimers[draftId]);
        await client
          .from('draft')
          .update({ timer_running: false })
          .eq('uuid', draftId);
        autoPick(draftId);
      }
    }, 1000);

    return true;
  } catch (err) {
    console.error('Caught exception:', err);
    throw err;
  }
};

function autoPick(draftId) {
    try {
      const { data, error } = client
        .from('draft')
        .select('current_pick_index, pick_order, current_pick_index, league_id, draft_type')
        .eq('uuid', draftId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      const currentPick = data.current_pick_index;
      const pickOrder = data.pick_order;
      const currentIndex = data.current_pick_index;
      const leagueId = data.league_id;


      


    } catch (err) {
      console.error('Caught exception in autoPick:', err);
      throw err;
    }
  };

  
  async function getAllPlayers() {
    const { data, error } = await client
      .from('characters')
      .select('ID, character_name, weight, captain, bunting, speed, fielding, curve, traj, stamina, pitching_arm, batting_arm, character_class, star_pitch, fielding_ability, star_swing, baserunning_ability, slap_size, charge_size, slap_power, charge_power, outfield_throwing, displayed_pitching, displayed_batting, displayed_fielding, dis_speed, curveball_speed, charge_pitch_speed, hit_curve, star_pitch_type');
  
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }
  
    return data.map(player => ({
      id: player.ID,
      name: player.character_name,
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
      starPitchType: player.star_pitch_type,
    }));
  }

exports.getAllPlayers = getAllPlayers;


  exports.getPlayerPool = async (draftId) => {
    const { data, error } = await client
    .from('draft_players')
    .select('character_picked')
    .eq('draft_id', draftId);


    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }

    const allPlayers = await getAllPlayers();

  
    const pickedCharacterIds = data.map(p => p.character_picked);

    
    const availablePlayers = allPlayers.filter(player => !pickedCharacterIds.includes(player.id));

    return availablePlayers;
  };

