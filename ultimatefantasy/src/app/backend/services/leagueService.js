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

  console.log('rows:', JSON.stringify(rows, null, 2));
  console.log('error:', error);

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

  const { data: leagueArr, error: leagueError } = await supabase.client
    .from('leagues')
    .insert({
      name: leagueData.leagueName,
      description: leagueData.leagueDescription,
      size: leagueData.leagueSize,
      draft_settings: leagueData.draftSettings,
      owner_id: userId
    })
    .select();

  if (leagueError) throw new Error(leagueError.message);

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
      description,
      size,
      draft_settings,
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
    description: data.description,
    size: data.size,
    draftSettings: data.draft_settings,
    members: (data.league_members || []).map(m => ({
      userId: m.user_id,
      role: m.role,
    }))
  };
};