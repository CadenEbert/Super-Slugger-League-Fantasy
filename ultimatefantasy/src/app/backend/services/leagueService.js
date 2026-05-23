const supabase = require('../supabase'); 

exports.getLeaguesForUser = async (userId) => {
  const { data: rows, error } = await supabase.client
    .from('league_members')
    .select(`
    role,
    league_id,
    leagues (
      id,
      name,
      created_at
    )
  `)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  const leagues = (rows || []).map(row => ({
    ...row.leagues,
    myRole: row.role
  }));

  if (leagues.length === 0) {
    return [];
  }

  const { data: members, error: countError } = await supabase.client
    .from('league_members')
    .select('league_id')
    .in('league_id', leagues.map(l => l.id));

  if (countError) throw new Error(countError.message);

  return leagues.map(league => ({
    ...league,
    memberCount: (members || []).filter(m => m.league_id === league.id).length
  }));

};

exports.createLeague = async (userId, leagueData) => {
  console.log('Creating league with data:', leagueData, 'for userId:', userId);


  const { data: profile, error: profileerr } = await supabase.client
  .from('profiles')
  .select('id, username')
  .eq('user_id', userId)
  .single();

  if (profileerr) throw new Error(profileerr.message);
  console.log('Fetched user profile:', profile);

  const { data: leagueArr, error: leagueError } = await supabase.client
    .from('leagues')
    .insert({
      name: leagueData.leagueName,
      roster_size: leagueData.roster_size,
      league_size: leagueData.league_size,
      owner_id: userId,
      owner_username: profile.username
    })
    .select();

    console.log('Inserted league, received data:', leagueArr, 'and error:', leagueError);

  if (leagueError) throw new Error(leagueError.message);

  const { error } = await supabase.client
    .from('draft')
    .insert({
      league_id: leagueArr[0].id,
      status: 'not_started',
      draft_type: leagueData.draftSettings === 'Snake' ? 'Snake' : 'Standard'
    })
    .select()
    .single();
    if (error) throw new Error(error.message);

    const { error: scheduleErr } = await supabase.client
    .from('schedule')
    .insert({
      league_id: leagueArr[0].id,
      owner_id: userId,
      status: 'not_started'
    });

    if (scheduleErr) throw new Error(scheduleErr.message);

 

  const league = leagueArr?.[0];
  if (!league) throw new Error('League creation failed');


  const { error: memberError } = await supabase.client
    .from('league_members')
    .insert({
      league_id: league.id,
      user_id: userId,
      role: 'owner',
      profile_id: profile.id
    });

  if (memberError) throw new Error(memberError.message);

  return league;
};

exports.fetchLeagueDetails = async (leagueId) => {
  const { data, error } = await supabase.client
    .from('leagues')
    .select(`
      id,
      name,
      league_size,
      draft_settings,
      owner_username,
      roster_size,
      league_members (
        user_id,
        role
      )
    `)
    .eq('id', leagueId)
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    name: data.name,
    size: data.size,
    draftSettings: data.draft_settings,
    ownerUsername: data.owner_username,
    rosterSize: data.roster_size,
    members: (data.league_members || []).map(m => ({
      userId: m.user_id,
      role: m.role,
    }))
  };
};

exports.joinLeague = async (leagueId, userId) => {
  console.log('User', userId, 'is attempting to join league with ID:', leagueId);
  const { data: profile, error: profileerr } = await supabase.client
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();


  if (profileerr) throw new Error(profileerr.message);

  const { data, error } = await supabase.client
    .from('league_members')
    .insert({
      league_id: leagueId,
      user_id: userId,
      role: 'member',
      profile_id: profile.id
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

exports.getUsersRosterId = async (leagueId, userId) => {
  const { data, error } = await supabase.client
    .from('rosters')
    .select('id')
    .eq('league_id', leagueId)
    .eq('owner_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data ? data.id : null;
}

exports.getOwnerId = async (leagueId) => {
  const { data, error } = await supabase.client
    .from('leagues')
    .select('owner_id')
    .eq('id', leagueId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? data.owner_id : null;
}

exports.deleteLeague = async (leagueId) => {
  console.log('Deleting league with ID:', leagueId);

  const { error: trades } = await supabase.client
    .from('trades')
    .delete()
    .eq('league_id', leagueId);
  console.log('trades error:', trades);
  if (trades) throw new Error(trades.message);

  const { error: playerstats } = await supabase.client
  .from('player_stats')
  .delete()
  .eq('league_id', leagueId);
console.log('trades error:', trades);
if (playerstats) throw new Error(playerstats.message);

  const { error: scheduleGamesError } = await supabase.client
    .from('schedule_games')
    .delete()
    .eq('league_id', leagueId);
  console.log('scheduleGamesError:', scheduleGamesError);
  if (scheduleGamesError) throw new Error(scheduleGamesError.message);

  const { error: scheduleError } = await supabase.client
    .from('schedule')
    .delete()
    .eq('league_id', leagueId);
  console.log('scheduleError:', scheduleError);
  if (scheduleError) throw new Error(scheduleError.message);

  const { error: draftPlayersError } = await supabase.client
    .from('draft_players')
    .delete()
    .eq('league_id', leagueId);
  console.log('draftPlayersError:', draftPlayersError);
  if (draftPlayersError) throw new Error(draftPlayersError.message);

  const { error: draftError } = await supabase.client
    .from('draft')
    .delete()
    .eq('league_id', leagueId);
  console.log('draftError:', draftError);
  if (draftError) throw new Error(draftError.message);

  const { data: rosterData, error: rosterError } = await supabase.client
    .from('rosters')
    .select('id')
    .eq('league_id', leagueId);
  console.log('rosterError:', rosterError);
  console.log('rosterData:', rosterData);
  if (rosterError) throw new Error(rosterError.message);

  const rosterIds = rosterData ? rosterData.map(r => r.id) : [];
  console.log('rosterIds:', rosterIds);

  if (rosterIds.length > 0) {
    const { error: rosterPlayersError } = await supabase.client
      .from('roster_players')
      .delete()
      .in('roster_id', rosterIds);
    console.log('rosterPlayersError:', rosterPlayersError);
    if (rosterPlayersError) throw new Error(rosterPlayersError.message);
  }

  const { error: rostersDeleteError } = await supabase.client
    .from('rosters')
    .delete()
    .eq('league_id', leagueId);
  console.log('rostersDeleteError:', rostersDeleteError);
  if (rostersDeleteError) throw new Error(rostersDeleteError.message);

  const { error: memberError } = await supabase.client
    .from('league_members')
    .delete()
    .eq('league_id', leagueId);
  console.log('memberError:', memberError);
  if (memberError) throw new Error(memberError.message);

  const { data, error } = await supabase.client
    .from('leagues')
    .delete()
    .eq('id', leagueId)
    .select();
  console.log('league delete error:', error);
  console.log('deleted league data:', data);

  if (error) throw new Error(error.message);

  return data && data.length > 0 ? data[0] : null;
};

exports.resetLeague = async (leagueId) => {

  const { error: tradesError } = await supabase.client
    .from('trades')
    .delete()
    .eq('league_id', leagueId);
  if (tradesError) throw new Error(tradesError.message);

  const { error: scheduleGamesError } = await supabase.client
    .from('schedule_games')
    .delete()
    .eq('league_id', leagueId);
  if (scheduleGamesError) throw new Error(scheduleGamesError.message);

  const { error: scheduleError } = await supabase.client
    .from('schedule')
    .update({
      status: 'not_started',
      current_week: '1',
      generated: false,
      standings: [],
      winner_username: null,
      current_round: 1
    })
    .eq('league_id', leagueId);
  if (scheduleError) throw new Error(scheduleError.message);

  const { data: draft } = await supabase.client
    .from('draft')
    .select('uuid')
    .eq('league_id', leagueId)
    .single();

  if (draft) {
    const { error: draftPlayersError } = await supabase.client
      .from('draft_players')
      .delete()
      .eq('draft_id', draft.uuid);
    if (draftPlayersError) throw new Error(draftPlayersError.message);

    const { error: draftError } = await supabase.client
      .from('draft')
      .update({
        current_pick: 0,
        current_round: 1,
        status: 'not_started',
        timer_running: false,
        current_pick_index: 0,
        player_pool: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76]
      })
      .eq('league_id', leagueId);
    if (draftError) throw new Error(draftError.message);
  }

  const { error: rosterPlayersError } = await supabase.client
    .from('roster_players')
    .delete()
    .eq('protected', false)
    .eq('league_id', leagueId);
  if (rosterPlayersError) throw new Error(rosterPlayersError.message);

  const { error: membersError } = await supabase.client
    .from('league_members')
    .update({ wins: 0, loses: 0 })
    .eq('league_id', leagueId);
  if (membersError) throw new Error(membersError.message);



}

exports.updateDraftSettings = async (leagueId, newSetting) => {
  console.log('Updating draft settings for league ID:', leagueId, 'with new setting:', newSetting);
  const { data, error } = await supabase.client
    .from('leagues')
    .update({ draft_settings: newSetting })
    .eq('id', leagueId)
    .select(); 

    if (error) throw new Error(error.message);

    return data && data.length > 0 ? data[0] : null;
}

exports.updateRosterLimit = async (leagueId, newLimit) => {
  console.log('Updating roster limit for league ID:', leagueId, 'with new limit:', newLimit);
  const { data, error } = await supabase.client
  .from('leagues')
  .update({ roster_size: newLimit })
  .eq('id', leagueId)
  .select();

  if (error) throw new Error(error.message);

  return data && data.length > 0 ? data[0] : null;
}

exports.leaveLeague = async (leagueId, userId) => {
 
    const { error: stats } = await supabase.client
    .from('player_stats')
    .delete()
    .eq('user_id', userId)
    .eq('league_id', leagueId);

    if (stats) {
      throw new Error(stats.message);
    }

    
    const { data: roster } = await supabase.client
      .from('rosters')
      .select('id')
      .eq('league_id', leagueId)
      .eq('owner_id', userId)
      .single();

    if (roster) {
      await supabase.client.from('roster_players').delete().eq('roster_id', roster.id);
      await supabase.client.from('rosters').delete().eq('id', roster.id);
    }

    const { error } = await supabase.client
      .from('league_members')
      .delete()
      .eq('league_id', leagueId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

  
}

exports.getProtections = async (leagueId) => {
    const { data, error } = await supabase.client
    .from('leagues')
    .select('protections')
    .eq('id', leagueId)
    .single();



    if (error) {
        throw new Error(error.message);
    }

    return data;
}

exports.updateProtectionLimit = async (leagueId, newLimit) => {
  console.log(leagueId, newLimit);
  const { data, error } = await supabase.client
  .from('leagues')
  .update({protections: newLimit})
  .eq('id', leagueId)
  .select();

  if (error) {
    throw new Error(error.message);
  }

  const { error: err } = await supabase.client
  .from('roster_players')
  .update({protected: false})
  .eq('league_id', leagueId);

  if (err) {
    throw new Error(error.message);
  }

  return data;
}