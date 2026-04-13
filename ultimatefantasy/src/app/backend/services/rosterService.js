const supabase = require('../supabase');

exports.getRoster = async (leagueId) => {
    const { data, error } = await supabase.client
        .from('rosters')
        .select(`
            id,
            team_name,
            owner_id,
            roster_players (
                player_id,
                position
            )
            `)
        .eq('league_id', leagueId);
    
    if (error) throw new Error(error.message);
    
    return (data || []).map(roster => ({
        id: roster.id,
        teamName: roster.team_name,
        ownerId: roster.owner_id,
        players: (roster.roster_players || []).map(rp => ({
            playerId: rp.player_id,
            position: rp.position,
        }))
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

exports.createRoster = async (leagueId, userId, teamName) => {
    const { data, error } = await supabase.client
        .from('rosters')
        .insert({
            league_id: leagueId,
            team_name: teamName,
            owner_id: userId
            
        })
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: data.id,
        teamName: data.team_name,
        ownerId: data.owner_id,
        players: []
    };
}