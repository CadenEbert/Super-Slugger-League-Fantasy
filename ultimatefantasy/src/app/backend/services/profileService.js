const supabase = require('../supabase');

exports.getProfile = async (userId) => {
    console.log('Fetching profile for user ID:', userId);
    
    // check how many rows exist
    const { data: allRows, error: allError } = await supabase.client
        .from('profiles')
        .select('username, user_id')
        .eq('user_id', userId);
    console.log('All matching rows:', allRows); // ← how many come back?
    console.log('Query error:', allError);

    const { data, error } = await supabase.client
        .from('profiles')
        .select('username, user_id')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Profile not found');
    return { username: data.username, user_id: data.user_id };
};