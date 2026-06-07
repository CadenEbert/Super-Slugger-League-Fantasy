import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const supabasePath = require.resolve('../src/app/backend/supabase.js');
const serverPath = require.resolve('../server.js');

const draftRow = {
    uuid: 'draft-1',
    league_id: 'league-1',
    status: 'active',
    current_pick: 1,
    current_round: 1,
    draft_type: 'snake',
    timer_seconds: 30,
    number_of_rounds: 10,
    time_per_pick: 30,
    pick_order: ['user-1', 'user-2'],
    current_pick_index: 0,
    timer_running: false,
    player_pool: ['char-2', 'char-4'],
};

const draftPlayers = [
    { id: 'row-1', draft_id: 'draft-1', character_picked: 'char-1', member_picking: 'user-1', league_id: 'league-1', pick_number: 1 },
    { id: 'row-2', draft_id: 'draft-1', character_picked: 'char-3', member_picking: 'user-2', league_id: 'league-1', pick_number: 2 },
];

const allCharacters = [
    { ID: 'char-1' },
    { ID: 'char-2' },
    { ID: 'char-3' },
    { ID: 'char-4' },
];

const leagueMembers = [
    { user_id: 'user-1', profiles: { username: 'alpha' } },
    { user_id: 'user-2', profiles: { username: 'beta' } },
];

const rosters = [
    { id: 'roster-1', owner_id: 'user-1' },
    { id: 'roster-2', owner_id: 'user-2' },
];

const rosterPlayers = [
    { character_id: 'char-1' },
    { character_id: 'char-3' },
];

const stateQueryMock = vi.fn(() => ({
    eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: draftRow, error: null }),
    })),
}));

const draftPlayersQueryMock = vi.fn(() => ({
    eq: vi.fn().mockResolvedValue({ data: draftPlayers, error: null }),
}));

const charactersQueryMock = vi.fn().mockResolvedValue({ data: allCharacters, error: null });

const leagueMembersQueryMock = vi.fn(() => ({
    eq: vi.fn().mockResolvedValue({ data: leagueMembers, error: null }),
}));

const rostersQueryMock = vi.fn(() => ({
    eq: vi.fn().mockResolvedValue({ data: rosters, error: null }),
}));

const rosterPlayersQueryMock = vi.fn(() => ({
    eq: vi.fn().mockResolvedValue({ data: rosterPlayers, error: null }),
}));

const updateQueryMock = vi.fn(() => ({
    eq: vi.fn().mockResolvedValue({ error: null }),
}));

const supabaseFromMock = vi.fn((table) => {
    if (table === 'draft') {
        return {
            select: vi.fn((query) => {
                if (query.includes('status')) {
                    return {
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({ data: { status: 'active' }, error: null }),
                        })),
                    };
                }

                return stateQueryMock();
            }),
            update: updateQueryMock,
        };
    }

    if (table === 'draft_players') {
        return {
            select: vi.fn((query) => {
                if (query.includes('character_picked, league_id')) {
                    return draftPlayersQueryMock();
                }

                return {
                    eq: vi.fn().mockResolvedValue({ data: draftPlayers, error: null }),
                };
            }),
        };
    }

    if (table === 'characters') {
        return {
            select: vi.fn(() => charactersQueryMock()),
        };
    }

    if (table === 'league_members') {
        return {
            select: vi.fn(() => leagueMembersQueryMock()),
        };
    }

    if (table === 'rosters') {
        return {
            select: vi.fn(() => rostersQueryMock()),
        };
    }

    if (table === 'roster_players') {
        return {
            select: vi.fn(() => rosterPlayersQueryMock()),
        };
    }

    return {};
});

require.cache[supabasePath] = {
    id: supabasePath,
    filename: supabasePath,
    loaded: true,
    exports: {
        client: {
            from: supabaseFromMock,
        },
        setupDraftChannel: vi.fn(),
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

const {
    getDraftState,
    getDraftIdByLeagueId,
    getAllLeagueMembers,
    getDraftStatus,
    getCanDraft,
    updateDraftData,
    getDraftPlayers,
    pauseDraftTimer,
    getPlayerPool,
} = require('../src/app/backend/services/draft.js');

describe('draft service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });



    it('returns the draft uuid for a league', async () => {
        supabaseFromMock.mockImplementationOnce(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({ data: { uuid: 'draft-1' }, error: null }),
                })),
            })),
        }));

        const result = await getDraftIdByLeagueId('league-1');

        expect(result).toBe('draft-1');
    });

    it('returns league members with usernames', async () => {
        const result = await getAllLeagueMembers('league-1');

        expect(result).toEqual([
            { user_id: 'user-1', username: 'alpha' },
            { user_id: 'user-2', username: 'beta' },
        ]);
    });

    it('returns draft status', async () => {
        const result = await getDraftStatus('league-1');

        expect(result).toBe('active');
    });

    it('returns whether the league can draft', async () => {
        const result = await getCanDraft('league-1');

        expect(result).toBe(true);
    });

    it('updates draft data', async () => {
        const result = await updateDraftData('draft-1', { status: 'in_progress' });

        expect(result).toBe(true);
    });

    it('returns draft players', async () => {
        const result = await getDraftPlayers('draft-1');

        expect(result).toEqual(draftPlayers);
    });

    it('pauses the draft timer', async () => {
        const result = await pauseDraftTimer('draft-1');

        expect(result).toBe(true);
    });

    it('returns available player pool', async () => {
        const result = await getPlayerPool('draft-1');

        expect(result).toEqual([
            { id: 'char-2' },
            { id: 'char-4' },
        ]);
    });
});