import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      GOOGLE_CLIENT_ID: 'test-client-id',
      GOOGLE_CLIENT_SECRET: 'test-client-secret',
    },
  },
})
