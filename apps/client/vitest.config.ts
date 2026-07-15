import { defineConfig } from 'vitest/config'

import { alias } from './vite.shared'

export default defineConfig({
  resolve: { alias },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'scripts/**/*.{test,spec}.mjs'],
    passWithNoTests: true,
    testTimeout: 10_000,
  },
})
