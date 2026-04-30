const { Observable } = require('rxjs');
const supabase = require('../supabase.js');

exports.signUp = async (email, password, username) => {


        const { data, error } = await supabase.client.auth.signUp({
            email,
            password
        });

        if (error) {
            console.error('Error signing up:', error);
            throw new Error(error.message);
        }

        const user = data.user.id;


        const { data: profileData, error: profileError } = await supabase.client
            .from('profiles')
            .insert({ username,  user_id: user })
            .select()
            .single();

        if (profileError) {
            console.error('Error inserting profile:', profileError);
            throw new Error(profileError.message);
        }


        return data.user;

}

exports.signIn = async (email, password) => {

    const { data, error } = await supabase.client.auth.signInWithPassword({
        email,
        password
    });


    if (error) {
        console.error('Error signing in:', error);
        throw new Error(error.message);
    }

    return data;
}

exports.getMe = async (req, res) => {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const { data, error } = await supabase.client.auth.getUser(token);
    if (error) return res.status(401).json({ error: error.message });

    return data.user.id;
};
