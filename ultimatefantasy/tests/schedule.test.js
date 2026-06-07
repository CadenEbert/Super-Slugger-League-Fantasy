import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const supabasePath = require.resolve('../src/app/backend/supabase.js');
const serverPath = require.resolve('../server.js');


const sceduleRow = {
    id: 'schedule-1',
    total_weeks: 7,
    league_id: 'league-1',
    owner_id: 'user-1',
    status: 'active',
    current_week: 1,
    generate: false,
    playoff_spots: 4,
    winner_username: null,
    current_round: 0
}

const scheduleGames = [
    { id: 'game-1', schedule_id: 'schedule-1', week: 1, team_a_id: 'team-1', team_b_id: 'team-2', winner_team_id: null, league_id: 'league-1' },
    { id: 'game-2', schedule_id: 'schedule-1', week: 1, team_a_id: 'team-3', team_b_id: 'team-4', winner_team_id: null, league_id: 'league-1' },
];

const stateQueryMock = vi.fn(() => ({
    eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: sceduleRow, error: null }),
    })),
}));


const scheduleGamesQueryMock = vi.fn(() => ({
    eq: vi.fn().mockResolvedValue({ data: scheduleGames, error: null }),
}));

require.cache[supabasePath] = {
    id: supabasePath,
    filename: supabasePath,
    loaded: true,
    exports: {
        client: {
            from: vi.fn((table) => {
                if (table === 'schedule') {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn().mockResolvedValue({ data: sceduleRow, error: null }),
                            })),
                        })),
                    };
                }
                if (table === 'schedule_games') {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn().mockResolvedValue({ data: scheduleGames, error: null }),
                        })),
                    };
                }
                return { select: vi.fn() };
            }),
        },
    },
};

require.cache[serverPath] = {
    id: serverPath,
    filename: serverPath,
    loaded: true,
    exports: {
        io: {
            to: vi.fn(() => ({
                emit: vi.fn(),
            })),
        },
    },
};


const { getSchedule, getScheduleGames } = require('../src/app/backend/services/schedule.js');

describe('schedule service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns the schedule state for a league', async () => {
        const result = await getSchedule('league-1');
        expect(result).toEqual(sceduleRow);
    });

    it('returns the schedule games for a league', async () => {
        const result = await getScheduleGames('league-1');
        expect(result).toEqual(scheduleGames);
    });
});