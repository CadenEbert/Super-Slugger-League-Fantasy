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

const matchup  = {
    homeTeam: 'home',
    awayTeam: 'away',
    week: 1
}

const testMembers = [
    {
    uuid: '1234',
    league_id: '5678',
    user_id: 'user1',
    },
    {
        uuid: '5467',
        league_id: '5678',
        user_id: 'user2',
    },
    {
        uuid: '7890',
        league_id: '5678',
        user_id: 'user3',
    },
    {
        uuid: '0987',
        league_id: '5678',
        user_id: 'user4',
    },
    {
        uuid: '5432',
        league_id: '5678',
        user_id: 'user5',
    },
    {
        uuid: '4321',
        league_id: '5678',
        user_id: 'user6',
    },
    {
        uuid: '6789',
        league_id: '5678',
        user_id: 'user7',
    },
    {
        uuid: '9876',
        league_id: '5678',
        user_id: 'user8',
    }
]

async function generateScheduleForLeague(members, numberOfMatchups, numberOfPlayoffs) {
    const schedule = [];
    const totalTeams = testMembers.length;
    const totalWeeks = 2 * (totalTeams);

    console.log('Generating schedule with parameters:', { totalTeams, numberOfMatchups, numberOfPlayoffs, totalWeeks });
   

    for (let week = 0; week <= totalWeeks; week++) {
        const matchups = [];
        const shuffledMembers = [...testMembers].sort(() => Math.random() - 0.5);

        for (let i = 0; i < totalTeams / 2; i++) {

            const homeTeam = shuffledMembers[i];
            const awayTeam = shuffledMembers[totalTeams - 1 - i];

            matchups.push({ homeTeam: homeTeam.user_id, awayTeam: awayTeam.user_id, week });
        }
        schedule.push(...matchups);
        
    }

    console.log('Generated schedule:', schedule);

    return schedule;
        
}


exports.generateSchedule = async (leagueId, numberOfMatchups, numberOfPlayoffs) => {
    try {
        const members = await get_league_members(leagueId);
        const rosters = await get_all_rosters(leagueId);
        const memberRosterMap = {};
        members.forEach(member => {
            const roster = rosters.find(r => r.owner_id === member.user_id);
            memberRosterMap[member.user_id] = roster;
        });

        const schedule = await generateScheduleForLeague(members, numberOfMatchups, numberOfPlayoffs);

        
        console.log('Final schedule to be saved:', schedule);

    }    catch (error) {
        console.error('generateSchedule error:', error.message);
        throw error;
    }
}
