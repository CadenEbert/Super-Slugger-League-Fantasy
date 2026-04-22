const supabase = require('../supabase');

exports.getProfile = async (userId) => {
    const { data, error } = await supabase.client
        .from('profiles')
        .select('username')
        .eq('user_id', userId)
        .single();

    if (error) throw new Error(error.message);
    return {
        username: data.username
    };
}