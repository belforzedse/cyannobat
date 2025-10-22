import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    env: {
      DATABASE_URI:
        process.env.DATABASE_URI ?? 'postgres://postgres:postgres@localhost:5432/cyannobat_test',
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ?? 'test-secret',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@styles': path.resolve(__dirname, './styles'),
      '@payload-config': path.resolve(__dirname, './src/payload.config.ts'),
    },
  },
})

