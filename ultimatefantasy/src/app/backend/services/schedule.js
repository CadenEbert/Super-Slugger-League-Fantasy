const { generate } = require('rxjs');
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

async function get_league_members(leagueId) {
    try {
        const { data: members, error } = await client
            .from('league_members')
            .select('*')
            .eq('league_id', leagueId);

        if (error) {
            console.error('Error fetching league members:', error);
            throw new Error('Failed to fetch league members');
        }

        return members;
    } catch (error) {
        console.error('get_league_members error:', error.message);
        throw error;
    }
}

async function get_all_rosters(leagueId) {
    try {
        const { data: rosters, error } = await client
            .from('rosters')
            .select('*')
            .eq('league_id', leagueId);

        if (error) {
            console.error('Error fetching rosters:', error);
            throw new Error('Failed to fetch rosters');
        }

        return rosters;
    } catch (error) {
        console.error('get_all_rosters error:', error.message);
        throw error;
    }
}

async function generateScheduleForLeague(members, numberOfMatchups, numberOfPlayoffs) {
    // Placeholder logic for schedule generation
    // In a real implementation, this would involve complex logic to create a balanced schedule
    const schedule = [];
    for (let i = 0; i < numberOfMatchups; i++) {
        const matchups = [];
        



exports.generateSchedule = async (leagueId, numberOfMatchups, numberOfPlayoffs) => {
    try {
        const members = await get_league_members(leagueId);
        const rosters = await get_all_rosters(leagueId);
        const memberRosterMap = {};
        members.forEach(member => {
            const roster = rosters.find(r => r.owner_id === member.user_id);
            memberRosterMap[member.user_id] = roster;
        });

        const schedule = generateScheduleForLeague(members, numberOfMatchups, numberOfPlayoffs);

        



