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
    week: 1,
    bye: false
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
    }
]

async function generateScheduleForLeague(members, weeks, numberInPlayoffs, leagueId) {
    const schedule = [];
    const totalTeams = testMembers.length;
    
    const totalWeeks = weeks - 1;
    

   


    if (totalTeams % 2 === 0) {
    for (let week = 0; week <= totalWeeks; week++) {
        const matchups = [];
        const shuffledMembers = [...testMembers].sort(() => Math.random() - 0.5);

        for (let i = 0; i < totalTeams / 2; i++) {

            const homeTeam = shuffledMembers[i];
            const awayTeam = shuffledMembers[totalTeams - 1 - i];

            matchups.push({ homeTeam: homeTeam.user_id, awayTeam: awayTeam.user_id, week, bye: false });
        }
        schedule.push(...matchups);
        
    }
    } else {
        let byeIndex = 0;
        for (let week = 0; week <= totalWeeks; week++) {
            const matchups = [];

            if (byeIndex >= totalTeams) {
                byeIndex = 0;
            }

            const playerOnBye = testMembers[byeIndex];
            const shuffledMembers = [...testMembers].filter(m => m.user_id !== playerOnBye.user_id).sort(() => Math.random() - 0.5);

            const byeMatchup = { homeTeam: playerOnBye.user_id, awayTeam: null, week: week + 1, bye: true };
            console.log('Adding bye matchup:', byeMatchup);
            matchups.push(byeMatchup);
            for (let i = 0; i < (totalTeams-1) /2; i++) {
                const homeTeam = shuffledMembers[i];
                const awayTeam = shuffledMembers[totalTeams - 2 - i];

                
    
                matchups.push({ homeTeam: homeTeam.user_id, awayTeam: awayTeam.user_id, week: week + 1, bye: false });
            }
            byeIndex++;
            
            schedule.push(...matchups);
        }

        const { data, error } = await client
            .from('schedule_games')
            .insert(schedule.map(game => ({
                league_id: game.league_id,
                home_team: game.homeTeam,
                away_team: game.awayTeam,
                week: game.week,
                bye: game.bye,
                league_id: leagueId
            })));

        if (error) {
            console.error('Error inserting schedule into database:', error);
            throw new Error('Failed to save schedule');
        }

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

        const schedule = await generateScheduleForLeague(members, numberOfMatchups, numberOfPlayoffs, leagueId);

        const { error } = await client
            .from('schedule')
            .update({
                generated: true,
                playoff_spots: numberOfPlayoffs,
                total_weeks: numberOfMatchups
            })
            .eq('league_id', leagueId);

        if (error) {
            console.error('Error updating schedule metadata:', error);
            throw new Error('Failed to update schedule metadata');
        }

       

        
        return schedule;

    }    catch (error) {
        console.error('generateSchedule error:', error.message);
        throw error;
    }
}

exports.clearSchedule = async (leagueId) => {
    try {
        const { data, error } = await client
            .from('schedule_games')
            .delete('*')
            .eq('league_id', leagueId);



        
        if (error) {
            console.error('Error clearing schedule:', error);
            throw new Error('Failed to clear schedule');
        }

        const { error: metadataError } = await client
            .from('schedule')
            .update({
                generated: false
            })
            .eq('league_id', leagueId);

        if (metadataError) {
            console.error('Error resetting schedule metadata:', metadataError);
            throw new Error('Failed to reset schedule metadata');
        }

    } catch (error) {
        console.error('clearSchedule error:', error.message);
        throw error;
    }
}

exports.getScheduleMetadata = async (leagueId) => {
    try {
        const { data: scheduleMetadata, error } = await client
            .from('schedule')
            .select('*')
            .eq('league_id', leagueId)
            .single();

        if (error) {
            console.error('Error fetching schedule metadata:', error);
            throw new Error('Failed to fetch schedule metadata');
        }

        return scheduleMetadata;
    } catch (error) {
        console.error('getScheduleMetadata error:', error.message);
        throw error;
    }
}

exports.getScheduleGames = async (leagueId) => {
    try {
        const { data: scheduleGames, error } = await client
            .from('schedule_games')
            .select('*')
            .eq('league_id', leagueId);

        if (error) {
            console.error('Error fetching schedule games:', error);
            throw new Error('Failed to fetch schedule games');
        }

        return scheduleGames;
    } catch (error) {
        console.error('getScheduleGames error:', error.message);
        throw error;
    }
}

exports.startSeason = async (leagueId) => {
    try {
        const { error } = await client
            .from('schedule')
            .update({
                status: 'in_progress'
            })
            .eq('league_id', leagueId);

        if (error) {
            console.error('Error starting season:', error);
            throw new Error('Failed to start season');
        }

    } catch (error) {
        console.error('startSeason error:', error.message);
        throw error;
    }
}
