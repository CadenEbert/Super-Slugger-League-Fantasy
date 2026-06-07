import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const supabasePath = require.resolve('../src/app/backend/supabase.js');

const { signUpMock, signInWithPassword, singleMock } = vi.hoisted(() => ({
  signUpMock: vi.fn(),
  signInWithPassword: vi.fn(),
  singleMock: vi.fn(),
}));

require.cache[supabasePath] = {
  id: supabasePath,
  filename: supabasePath,
  loaded: true,
  exports: {
    authClient: {
      auth: {
        signUp: signUpMock,
        signInWithPassword: signInWithPassword,
      },
    },
    client: {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: singleMock,
          })),
        })),
      })),
    },
  },
};

const { signUp } = require('../src/app/backend/services/auth.js');
const { signIn } = require('../src/app/backend/services/auth.js');

describe('signUp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a user on successful signup', async () => {
    signUpMock.mockResolvedValue({
      data: { user: { id: 'user-id', email: 'test@gmail.com' } },
      error: null,
    });

    singleMock.mockResolvedValue({
      data: { id: 'profile-1' },
      error: null,
    });

    const result = await signUp('test@gmail.com', 'password123', 'testuser');

    expect(result).toEqual({ id: 'user-id', email: 'test@gmail.com' });
    expect(signUpMock).toHaveBeenCalledWith({
      email: 'test@gmail.com',
      password: 'password123',
    });
  });
  
  it('returns auth data on successful signin', async () => {
    signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user-id', email: 'test@gmail.com' },
        session: { access_token: 'token-123' },
      },
      error: null,
    });

    const result = await signIn('test@gmail.com', 'password123');

    expect(result).toEqual({
      user: { id: 'user-id', email: 'test@gmail.com' },
      session: { access_token: 'token-123' },
    });

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'test@gmail.com',
      password: 'password123',
    });
  });

});