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

  const { data: leagueArr, error: leagueError } = await supabase.client
    .from('leagues')
    .insert({
      name: leagueData.leagueName,
      roster_size: leagueData.roster_size,
      size: leagueData.leagueSize,
      draft_settings: leagueData.draftSettings,
      owner_id: userId,
      owner_username: leagueData.userName || 'Unknown User'
    })
    .select();



  if (leagueError) throw new Error(leagueError.message);

  const {  } = await supabase.client
    .from('draft')
    .insert({
      league_id: leagueArr[0].id,
      status: 'not_started',
      draft_type: leagueData.draftSettings === 'snake' ? 'snake' : 'linear'
    })
    .select()
    .single();

  const league = leagueArr?.[0];
  if (!league) throw new Error('League creation failed');


  const { error: memberError } = await supabase.client
    .from('league_members')
    .insert({
      league_id: league.id,
      user_id: userId,
      role: 'owner'
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
      size,
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

exports.deleteLeague = async (leagueId) => {
  console.log('Deleting league with ID:', leagueId);


  const { error: draftPlayersError } = await supabase.client
    .from('draft_players')
    .delete()
    .eq('league_id', leagueId);
  if (draftPlayersError) throw new Error(draftPlayersError.message);


  const { error: draftError } = await supabase.client
    .from('draft')
    .delete()
    .eq('league_id', leagueId);
  if (draftError) throw new Error(draftError.message);


  const { data: rosterData, error: rosterError } = await supabase.client
    .from('rosters')
    .select('id')
    .eq('league_id', leagueId);
  if (rosterError) throw new Error(rosterError.message);

  const rosterIds = rosterData ? rosterData.map(r => r.id) : [];
  if (rosterIds.length > 0) {
    const { error: rosterPlayersError } = await supabase.client
      .from('roster_players')
      .delete()
      .in('roster_id', rosterIds);
    if (rosterPlayersError) throw new Error(rosterPlayersError.message);
  }


  const { error: rostersDeleteError } = await supabase.client
    .from('rosters')
    .delete()
    .eq('league_id', leagueId);
  if (rostersDeleteError) throw new Error(rostersDeleteError.message);

  const { error: memberError } = await supabase.client
    .from('league_members')
    .delete()
    .eq('league_id', leagueId);
  if (memberError) throw new Error(memberError.message);


  const { data, error } = await supabase.client
    .from('leagues')
    .delete()
    .eq('id', leagueId)
    .select();
  if (error) throw new Error(error.message);

  return data && data.length > 0 ? data[0] : null;
};

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