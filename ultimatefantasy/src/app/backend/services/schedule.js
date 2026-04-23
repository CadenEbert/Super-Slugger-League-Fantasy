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
        const { data: schedule, error } = await client
            .from('schedule')
            .select('*')
            .eq('league_id', leagueId)
            .single();

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

        const {data: members, error: membersError} = await client
            .from('league_members')
            .select('*, profiles(username)')
            .eq('league_id', leagueId);

        if (membersError) {
            console.error('Error fetching league members for standings update:', membersError);
            throw new Error('Failed to fetch league members for standings update');
        }

        const membersMapp = members.map(m => ({ user_id: m.user_id, username: m.profiles.username }));
        const membersMap = [
            {
                user_id: 'user1',
                username: 'Player 1',
                team_image: 'MarioFireballs',
            },
            {
                user_id: 'user2',
                username: 'Player 2',
                team_image: 'BirdoBows',
            },
            {
                user_id: 'user3',
                username: 'Player 3',
                team_image: 'DaisyFlowers',
            },
            {
                user_id: 'user4',
                username: 'Player 4',
                team_image: 'LuigiKnights',
            },
            {
                user_id: 'user5',
                username: 'Player 5',
                team_image: 'BowserMonsters',
            },
            {
                user_id: 'user6',
                username: 'Player 6',
                team_image: 'LuigiKnights',
            },
            {
                user_id: 'user7',
                username: 'Player 7',
                team_image: 'BowserMonsters',
            }
        ];

        const scheduleGamesTest = [
            {
                week: 1,
                home_team_uuid: 'user1',
                away_team_uuid: 'user2',
                home_score: 100,
                away_score: 90,
                
                bye: false,
            },
            {
                week: 1,
                home_team_uuid: 'user3',
                away_team_uuid: 'user4',
                home_score: 80,
                away_score: 110,
                bye: false,
            },
            {
                week: 1,
                home_team_uuid: 'user5',
                away_team_uuid: null,
                home_score: null,
                away_score: null,
                bye: true,
            },
            {
                week: 1,
                home_team_uuid: 'user6',
                away_team_uuid: 'user7',
                home_score: 95,
                away_score: 105,
                bye: false,
            }
        ];
        const standings = {};

        const curr_week = 1;


        for (let i = 1; i <= curr_week; i++) {
            //const gamesForWeek = scheduleGames.filter(game => game.week === i && !game.bye);
            const gamesForWeek = scheduleGamesTest.filter(game => game.week === i && !game.bye);
            console.log('Processing standings for week', i, 'with games:', gamesForWeek);
            for (let j = 0; j < gamesForWeek.length; j++ ) {
                if (gamesForWeek[j].home_score > gamesForWeek[j].away_score) {

                    console.log('Updating standings for week', i, 'game', j, 'home team win');
                    standings[gamesForWeek[j].home_team_uuid] = standings[gamesForWeek[j].home_team_uuid] || { wins: 0, losses: 0, username: membersMap.find(m => m.user_id === gamesForWeek[j].home_team_uuid)?.username || 'Unknown', team_image: membersMap.find(m => m.user_id === gamesForWeek[j].home_team_uuid)?.team_image || null };
                    standings[gamesForWeek[j].home_team_uuid].wins += 1;

                    standings[gamesForWeek[j].away_team_uuid] = standings[gamesForWeek[j].away_team_uuid] || { wins: 0, losses: 0, username: membersMap.find(m => m.user_id === gamesForWeek[j].away_team_uuid)?.username || 'Unknown', team_image: membersMap.find(m => m.user_id === gamesForWeek[j].away_team_uuid)?.team_image || null };
                    standings[gamesForWeek[j].away_team_uuid].losses += 1;

                } else if (gamesForWeek[j].home_score < gamesForWeek[j].away_score) {
                    console.log('Updating standings for week', i, 'game', j, 'home team win');
                    standings[gamesForWeek[j].home_team_uuid] = standings[gamesForWeek[j].home_team_uuid] || { wins: 0, losses: 0, username: membersMap.find(m => m.user_id === gamesForWeek[j].home_team_uuid)?.username || 'Unknown', team_image: membersMap.find(m => m.user_id === gamesForWeek[j].home_team_uuid)?.team_image || null };
                    standings[gamesForWeek[j].home_team_uuid].losses += 1;

                    standings[gamesForWeek[j].away_team_uuid] = standings[gamesForWeek[j].away_team_uuid] || { wins: 0, losses: 0, username: membersMap.find(m => m.user_id === gamesForWeek[j].away_team_uuid)?.username || 'Unknown', team_image: membersMap.find(m => m.user_id === gamesForWeek[j].away_team_uuid)?.team_image || null };
                    standings[gamesForWeek[j].away_team_uuid].wins += 1;
                }


            }
        }

        const sortedTeams = await sortTeamsByStandings(standings);

        return sortedTeams;
    } catch (error) {
        console.error('updateStandings error:', error.message);
        throw error;
    }
}

async function sortTeamsByStandings(standings) {
    return Object.entries(standings)
        .sort((a, b) => b[1].wins - a[1].wins)
        .map(([user_id, team]) => ({ user_id, ...team }));
}

exports.completeWeek = async (leagueId, current_week) => {
    try {

        const { data, errorsch } = await client
            .from('schedule')
            .select('total_weeks')
            .eq('league_id', leagueId);

        console.log('Completing week', current_week, 'for league', leagueId, 'with total weeks:', data[0].total_weeks);

        if (errorsch) {
            console.error('Error fetching current week:', errorsch);
            throw new Error('Failed to fetch current week');
        }

        if (parseInt(current_week) == data[0].total_weeks) {
            const { error } = await client
                .from('schedule')
                .update({
                    status: 'playoffs_not_started'
                })
                .eq('league_id', leagueId);

            if (error) {
                console.error('Error marking season as completed:', error);
                throw new Error('Failed to mark season as completed');
            }
            return;
        }




        
        const { error } = await client
            .from('schedule')
            .update({
                current_week: parseInt(current_week) + 1
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





exports.startPlayoffs = async (leagueId, playoffTeams) => {
    try {
        console.log('Starting playoffs for league:', leagueId);
        console.log('Playoff teams:', playoffTeams);

        const { error } = await client
            .from('schedule')
            .update({
                status: 'playoffs_in_progress'
            })
            .eq('league_id', leagueId);

        if (error) {
            console.error('Error starting playoffs:', error);
            throw new Error('Failed to start playoffs');
        }

        const playoffMatchups = [];

        for (let i = 0; i < playoffTeams.length / 2; i ++) {
            const homeTeam = playoffTeams[i];
            const awayTeam = playoffTeams[playoffTeams.length - 1 - i];

            const matchup = {
                league_id: leagueId,
                home_team: homeTeam.username,
                away_team: awayTeam.username,
                week: 1,
                bye: false,
                home_team_uuid: homeTeam.user_id,
                away_team_uuid: awayTeam.user_id,
                playoff_game: true
            };
            playoffMatchups.push(matchup);
        }

        const { data, insertError } = await client
            .from('schedule_games')
            .insert(playoffMatchups);

        if (insertError) {
            console.error('Error inserting playoff matchups:', insertError);
            throw new Error('Failed to insert playoff matchups');
        }

    } catch (error) {
        console.error('startPlayoffs error:', error.message);
        throw error;
    }
}


exports.getPlayoffGames = async (leagueId) => {
    try {
        console.log('Fetching playoff matchups for league:', leagueId);
        const { data: playoffMatchups, error } = await client
            .from('schedule_games')
            .select('*')
            .eq('league_id', leagueId)
            .eq('playoff_game', true);

        if (error) {
            console.error('Error fetching playoff matchups:', error);
            throw new Error('Failed to fetch playoff matchups');
        }

        return playoffMatchups;
    } catch (error) {
        console.error('getPlayoffMatchups error:', error.message);
        throw error;
    }
}