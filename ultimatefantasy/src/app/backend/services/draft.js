const { client, setupDraftChannel } = require('../supabase.js');

const io = require('../../../../server.js').io;

const activeTimers = {};



exports.getDraftState = async (leagueId) => {
  console.log('Fetching draft state for leagueId:', leagueId);

  const { data, error } = await client
    .from('draft')
    .select('uuid, league_id, status, current_pick, current_round,  draft_type, timer_seconds,  number_of_rounds, time_per_pick, pick_order, current_pick_index, timer_running, player_pool')
    .eq('league_id', leagueId)
    .single();

  const { data: poolData, error: poolError } = await client
    .from('draft_players')
    .select('id, draft_id, character_picked, member_picking, league_id, pick_number')
    .eq('league_id', leagueId);

  const { data: allPlayers, error: allPlayersError } = await client
    .from('characters')
    .select('ID');

  if (poolError) {
    console.error('Supabase error fetching draft players:', poolError);
    throw new Error(poolError.message);
  }

  if (error) throw new Error(error.message);

  updatePlayerPool(data.uuid).catch(err => {
    console.error('Error updating player pool:', err);
  });



  console.log('Draft state data from database:', data);

  return data;
};

async function updatePlayerPool(draftId) {
  const { data: pickedData, error: pickedError } = await client
    .from('draft_players')
    .select('character_picked')
    .eq('draft_id', draftId);

  if (pickedError) {
    console.error('Supabase error fetching picked characters:', pickedError);
    throw new Error(pickedError.message);
  }


  const { data: allPlayers, error: allPlayersError } = await client
    .from('characters')
    .select('ID');

  if (allPlayersError) {
    console.error('Supabase error fetching all characters:', allPlayersError);
    throw new Error(allPlayersError.message);
  }


  const pickedCharacterIds = pickedData.map(p => p.character_picked);
  const availablePlayerIds = allPlayers
    .filter(player => !pickedCharacterIds.includes(player.ID))
    .map(player => player.ID);


  const { error: updateError } = await client
    .from('draft')
    .update({ player_pool: availablePlayerIds })
    .eq('uuid', draftId);

  if (updateError) {
    console.error('Supabase error updating player pool:', updateError);
    throw new Error(updateError.message);
  }
}


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

exports.getDraftStatus = async (leagueId) => {
    console.log('Fetching draft status for leagueId:', leagueId);
    const { data, error } = await client
        .from('draft')
        .select('status')
        .eq('league_id', leagueId)
        .single();

    console.log('Draft status data from database:', data, 'error:', error);
    if (error) throw new Error(error.message);

    return data.status;
};

exports.getCanDraft = async (leagueId) => {

    console.log('Checking if user can draft for leagueId:', leagueId);
    const { data: rostersData, error } = await client
        .from('rosters')
        .select('*')
        .eq('league_id', leagueId);

    if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
    }

    const { data: membersData, error: membersError } = await client
        .from('league_members')
        .select('user_id')
        .eq('league_id', leagueId);

    if (membersError) {
        console.error('Supabase error fetching league members:', membersError);
        throw new Error(membersError.message);
    }

   return membersData.length === rostersData.length;
};

exports.updateDraftData = async (draftId, data) => {
  console.log(`Updating draft data for draftId: ${draftId} with data:`, data);
  const { error } = await client
    .from('draft')
    .update(data)
    .eq('uuid', draftId);

  updatePlayerPool(draftId).catch(err => {
    console.error('Error updating player pool:', err);
  });

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

      updatePlayerPool(draftId).catch(err => {
        console.error('Error updating player pool:', err);
      });

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



async function getAllPlayers() {
  const { data, error } = await client
    .from('characters')
    .select('ID, character_name, weight, captain, bunting, speed, fielding, curve, traj, stamina, pitching_arm, batting_arm, character_class, star_pitch, fielding_ability, star_swing, baserunning_ability, slap_size, charge_size, slap_power, charge_power, outfield_throwing, displayed_pitching, displayed_batting, displayed_fielding, dis_speed, curveball_speed, charge_pitch_speed, hit_curve, star_pitch_type, character_image');

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message);
  }

  

  return data.map(player => ({
    id: player.ID,
    character_image: player.character_image,
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



exports.makeDraftPick = async (draftId, characterId, memberPicking) => {
  try {
    console.log(`Making draft pick for draftId: ${draftId}, characterId: ${characterId}, memberPicking: ${memberPicking}`);

    const { data, error } = await client
      .from('draft')
      .select('current_pick, pick_order, current_pick_index, league_id, draft_type, player_pool, time_per_pick, reversed, end_of_snake, current_round, number_of_rounds')
      .eq('uuid', draftId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }

    const { current_pick, pick_order, current_pick_index, league_id, draft_type, player_pool, time_per_pick, reversed, end_of_snake, current_round, number_of_rounds } = data;
    const totalPicks = pick_order.length;

    if (!player_pool.includes(characterId)) {
      throw new Error('Character already picked');
    }

    const newPlayerPool = player_pool.filter(id => id !== characterId);

    const { error: insertError } = await client
      .from('draft_players')
      .insert({
        draft_id: draftId,
        character_picked: characterId,
        member_picking: memberPicking,
        league_id: league_id,
        pick_number: current_pick
      });

    if (insertError) {
      console.error('Supabase error inserting pick:', insertError);
      throw new Error(insertError.message);
    }

    let nextIndex = current_pick_index;
    let nextReversed = reversed;
    let nextSnakeEnd = end_of_snake;
    let nextRound = current_round;
    let finalRound = false;

  
    if (draft_type === 'Snake') {
     
      if (!reversed) {
        if (current_pick_index === totalPicks - 1) {
         
          if (current_round === number_of_rounds) {
            finalRound = true;
          } else {
            nextRound = current_round + 1;
          }
          nextReversed = true;
          nextIndex = totalPicks - 1; 
        } else {
          nextIndex = current_pick_index + 1;
        }
      } else {
       
        if (current_pick_index === 0) {
          if (current_round === number_of_rounds) {
            finalRound = true;
          } else {
            nextRound = current_round + 1;
          }
          nextReversed = false;
          nextIndex = 0;
        } else {
          nextIndex = current_pick_index - 1;
        }
      }
    } else if (draft_type === 'Standard') {
      nextIndex = current_pick_index >= totalPicks - 1 ? 0 : current_pick_index + 1;
      if (current_pick_index >= totalPicks - 1) {
        if (current_round === number_of_rounds) {
          finalRound = true;
        } else {
          nextRound = current_round + 1;
        }
      }
    }

    if (finalRound) {
      console.log('Draft completed after this pick');
      exports.pauseDraftTimer(draftId);
      await finishDraft(draftId, league_id);
    }

    const { error: updateError } = await client
      .from('draft')
      .update({
        current_pick: current_pick + 1,
        current_pick_index: nextIndex,
        reversed: nextReversed,
        end_of_snake: nextSnakeEnd,
        player_pool: newPlayerPool,
        current_round: nextRound,
        status: finalRound ? 'completed' : 'in_progress',
        timer_seconds: time_per_pick,
      })
      .eq('uuid', draftId);

    if (updateError) {
      console.error('Supabase error updating draft:', updateError);
      throw new Error(updateError.message);
    }



    return true;
  } catch (err) {
    console.error('Caught exception in makeDraftPick:', err);
    throw err;
  }
};

async function autoPick(draftId) {
  try {
    const { data, error } = await client
      .from('draft')
      .select('current_pick, pick_order, current_pick_index, league_id, draft_type, player_pool, time_per_pick, reversed, end_of_snake, current_round, number_of_rounds, status')
      .eq('uuid', draftId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }

    if (data.status === 'completed') return;

    const {
      current_pick, pick_order, current_pick_index, league_id,
      draft_type, player_pool, time_per_pick, reversed,
      end_of_snake, current_round, number_of_rounds
    } = data;
    const totalPicks = pick_order.length;
    console.log('totalPicks:', totalPicks, 'current_pick_index:', current_pick_index, 'current_round:', current_round);

    if (!player_pool || player_pool.length === 0) {
      await finishDraft(draftId, league_id);
      await exports.pauseDraftTimer(draftId);
      return;
    }

    const memberPicking = pick_order[current_pick_index];
    const characterId = player_pool[0];

    const { error: insertError } = await client
      .from('draft_players')
      .insert({
        draft_id: draftId,
        character_picked: characterId,
        member_picking: memberPicking,
        league_id: league_id,
        pick_number: current_pick + 1
      });

    if (insertError) {
      console.error('Supabase error inserting autopick:', insertError);
      throw new Error(insertError.message);
    }

    let nextIndex = current_pick_index;
    let nextReversed = reversed;
    let nextSnakeEnd = end_of_snake;
    let nextRound = current_round;
    let finalRound = false;


    if (draft_type === 'Snake') {
      if (!reversed) {
        if (current_pick_index === totalPicks - 1) {
          if (current_round === number_of_rounds) {
            finalRound = true;
          } else {
            nextRound = current_round + 1;
          }
          nextReversed = true;
          nextIndex = totalPicks - 1;
        } else {
          nextIndex = current_pick_index + 1;
        }
      } else {
        if (current_pick_index === 0) {
          if (current_round === number_of_rounds) {
            finalRound = true;
          } else {
            nextRound = current_round + 1;
          }
          nextReversed = false;
          nextIndex = 0;
        } else {
          nextIndex = current_pick_index - 1;
        }
      }
    } else if (draft_type === 'Standard') {
      nextIndex = current_pick_index >= totalPicks - 1 ? 0 : current_pick_index + 1;
      if (current_pick_index >= totalPicks - 1) {
        if (current_round === number_of_rounds) {
          finalRound = true;
        } else {
          nextRound = current_round + 1;
        }
      }
    }

    const newPlayerPool = player_pool.filter(id => id !== characterId);

    const { error: updateError } = await client
      .from('draft')
      .update({
        current_pick: current_pick + 1,
        current_pick_index: nextIndex,
        reversed: nextReversed,
        end_of_snake: nextSnakeEnd,
        player_pool: newPlayerPool,
        current_round: nextRound,
        status: finalRound ? 'completed' : 'in_progress',
        timer_seconds: time_per_pick
      })
      .eq('uuid', draftId);

    if (updateError) {
      console.error('Supabase error updating draft:', updateError);
      throw new Error(updateError.message);
    }



    await exports.startDraftTimer(draftId, time_per_pick);

  } catch (err) {
    console.error('Caught exception in autoPick:', err);
    throw err;
  }
}

async function finishDraft(draftId, leagueId) {
  try {
    const { data, error } = await client
      .from('draft')
      .select('league_id')
      .eq('uuid', draftId)
      .single();

    if (error) {
      console.error('Supabase error fetching draft for finishDraft:', error);
      throw new Error(error.message);
    }

    const leagueId = data.league_id;


    const { data: draftPlayers, error: draftPlayersError } = await client
      .from('draft_players')
      .select('member_picking, character_picked')
      .eq('draft_id', draftId);

    if (draftPlayersError) {
      console.error('Supabase error fetching draft players:', draftPlayersError);
      throw new Error(draftPlayersError.message);
    }


    const { data: rosters, error: rostersError } = await client
      .from('rosters')
      .select('id, owner_id')
      .eq('league_id', leagueId);

    if (rostersError) {
      console.error('Supabase error fetching rosters:', rostersError);
      throw new Error(rostersError.message);
    }

    const rosterMap = {};
    rosters.forEach(r => {
      rosterMap[r.owner_id] = r.id;
    });


    const rosterPlayerRows = draftPlayers.map(pick => ({
      roster_id: rosterMap[pick.member_picking],
      character_id: pick.character_picked,
      position: 'Bench',
      league_id: leagueId
    }));

    const { error: insertError } = await client
      .from('roster_players')
      .insert(rosterPlayerRows);

    if (insertError) {
      console.error('Supabase error inserting roster players:', insertError);
      throw new Error(insertError.message);
    }

  } catch (err) {
    console.error('Caught exception in finishDraft:', err);
    throw err;
  }
}