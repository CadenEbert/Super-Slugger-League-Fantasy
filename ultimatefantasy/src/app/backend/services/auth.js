const { client, authClient } = require('../supabase.js');

exports.signUp = async (email, password, username) => {
  const { data, error } = await authClient.auth.signUp({ email, password });

  if (error) {
    console.error('Error signing up:', error);
    throw new Error(error.message);
  }

  const userId = data.user.id;

  
  const { error: profileError } = await client
    .from('profiles')
    .insert({ username, user_id: userId })
    .select()
    .single();

  if (profileError) {
    console.error('Error inserting profile:', profileError);
    throw new Error(profileError.message);
  }

  return {
    user: data.user,
    session: data.session,
  };
};

exports.signIn = async (email, password) => {
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Error signing in:', error);
    throw new Error(error.message);
  }

  return data;
};

exports.getMe = async (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data, error } = await authClient.auth.getUser(token);
  if (error) return res.status(401).json({ error: error.message });

  return data.user.id;
};