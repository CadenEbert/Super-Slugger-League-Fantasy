import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    env: {
      SUPABASE_URL: 'https://fake.supabase.co',
      SUPABASE_SERVICE_KEY: 'fake-service-key',
      SUPABASE_ANON_KEY: 'fake-anon-key',
    },
    server: {
      deps: {
        interopDefault: true,
      }
    }
  },
})