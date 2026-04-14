const supabase = require('../supabase.js');

exports.getDraftState = async (leagueId) => {
    const { data, error } = await supabase.client
        .from('draft')
        .select('*')
        .eq('league_id', leagueId)
        .single();

    if (error) throw new Error(error.message);

    return data;
};

exports.updateDraftState = async (leagueId, draftState) => {
    const { data, error } = await supabase.client
        .from('draft')
        .update({ draft_state: draftState })
        .eq('league_id', leagueId)
        .select()
        .single();

    if (error) throw new Error(error.message);

    return data;
};