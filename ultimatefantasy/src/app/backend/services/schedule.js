const { client, setupDraftChannel } = require('../supabase.js');


exports.getSchedule = async (leagueId) => {
    try {
        const { data: schedule, error } = await client
            .from('schedule')
            .select('*')
            .eq('league_id', leagueId)
            .single();

        if (error) {
            console.error('Error fetching schedule:', error);
            throw new Error('Failed to fetch schedule');
        }

        return schedule;
    } catch (error) {
        console.error('getSchedule error:', error.message);
        throw error;
    }
}