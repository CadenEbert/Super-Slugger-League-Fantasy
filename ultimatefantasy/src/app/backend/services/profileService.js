const supabase = require('../supabase');

exports.getProfile = async (userId) => {
    const { data, error } = await supabase.client
        .from('profiles')
        .select('username, user_id, created_at')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Profile not found');

    const formattedDate = new Date(data.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return { username: data.username, user_id: data.user_id, created_at: formattedDate };
};

exports.changeUsername = async (userId, newUsername) => {
    const { data: profile, error: profileError } = await supabase.client
      .from('profiles')
      .select('username')
      .eq('user_id', userId)
      .single();
  
      console.log(profileError);
    if (profileError) throw new Error(profileError.message);
    const oldUsername = profile.username;
  
    const { data, error } = await supabase.client
      .from('profiles')
      .update({ username: newUsername })
      .eq('user_id', userId)
      .select('username, user_id, created_at')
      .single();
  
      console.log(error);
    if (error) throw new Error(error.message);
  

  
    return data;
  };
