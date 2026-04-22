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
            .select('*, profiles(username)')
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
    bye: false,
    homeTeamUuid: 'home-uuid',
    awayTeamUuid: 'away-uuid'
}

const testMembers = [
    {
    uuid: '1234',
    league_id: '5678',
    user_id: 'user1',

    },
    {
        username: '5467',
        league_id: '5678',
        user_id: 'user2',
    },
    {
        username: '7890',
        league_id: '5678',
        user_id: 'user3',
    },
    {
        username: '0987',
        league_id: '5678',
        user_id: 'user4',
    },
    {
        username: '5432',
        league_id: '5678',
        user_id: 'user5',
    },
    {
        username: '4321',
        league_id: '5678',
        user_id: 'user6',
    },
    {
        username: '6789',
        league_id: '5678',
        user_id: 'user7',
    }
]

async function generateScheduleForLeague(members, weeks, numberInPlayoffs, leagueId) {
    const schedule = [];
    const totalTeams = members.length;
    
    const totalWeeks = weeks - 1;
    

   


    if (totalTeams % 2 === 0) {
    for (let week = 0; week <= totalWeeks; week++) {
        const matchups = [];
        const shuffledMembers = [...testMembers].sort(() => Math.random() - 0.5);

        for (let i = 0; i < totalTeams / 2; i++) {

            const homeTeam = shuffledMembers[i];
            const awayTeam = shuffledMembers[totalTeams - 1 - i];

            matchups.push({ homeTeam: homeTeam.profiles.username, awayTeam: awayTeam.profiles.username, week, bye: false, homeTeamUuid: homeTeam.user_id, awayTeamUuid: awayTeam.user_id });
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

                
    
                matchups.push({ homeTeam: homeTeam.username, awayTeam: awayTeam.username, week: week + 1, bye: false, homeTeamUuid: homeTeam.user_id, awayTeamUuid: awayTeam.user_id });
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
                league_id: leagueId,
                home_team_uuid: game.homeTeamUuid,
                away_team_uuid: game.awayTeamUuid
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

exports.updateGame = async (gameId, homeTeam, awayTeam, homeScore, awayScore, stadium, homeTeamuuid, awayTeamuuid) => {

    try {
        const { error } = await client
            .from('schedule_games')
            .update({
                home_team: homeTeam,
                away_team: awayTeam,
                home_score: homeScore,
                away_score: awayScore,
                home_team_uuid: homeTeamuuid,
                away_team_uuid: awayTeamuuid,
                stadium,
                home_team_uuid: homeTeamuuid,
                away_team_uuid: awayTeamuuid
            })
            .eq('id', gameId);

        if (error) {
            console.error('Error updating game:', error);
            throw new Error('Failed to update game');
        }
    } catch (error) {
        console.error('updateGame error:', error.message);
        throw error;
    }
}

exports.getMembers = async (leagueId) => {
    try {
        const { data: members, error } = await client
            .from('league_members')
            .select('*, profiles(username)')
            .eq('league_id', leagueId);

        if (error) {
            console.error('Error fetching league members:', error);
            throw new Error('Failed to fetch league members');
        }

        return members;
    } catch (error) {
        console.error('getMembers error:', error.message);
        throw error;
    }
}


exports.updateStandings = async (leagueId) => {
    try {
        const { data: standings, error } = await client
            .from('standings')
            .select('*')
            .eq('league_id', leagueId);

        if (error) {
            console.error('Error fetching standings:', error);
            throw new Error('Failed to fetch standings');
        }

        const {data: scheduleGames, error: gamesError} = await client
            .from('schedule_games')
            .select('*')
            .eq('league_id', leagueId);

        if (gamesError) {
            console.error('Error fetching schedule games for standings update:', gamesError);
            throw new Error('Failed to fetch schedule games for standings update');
        }

        

        return standings;
    } catch (error) {
        console.error('updateStandings error:', error.message);
        throw error;
    }
}

completeWeek = async (leagueId, current_week) => {
    try {
        console.log(`Completing week ${current_week} for league ${leagueId}`);
        const {data, error} = await client
            .from('schedule')
            .update({
                current_week: parseInt(weekNumber) + 1
            })
            .eq('league_id', leagueId);

        if (error) {
            console.error('Error updating current week:', error);
            throw new Error('Failed to update current week');
        }

    } catch (error) {
        console.error('completeWeek error:', error.message);
        throw error;
    }

}