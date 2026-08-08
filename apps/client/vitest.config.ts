import { mergeConfig } from 'vitest/config'
import { defineConfig } from 'vitest/config'
import { createViteConfig } from './vite.config'

export default defineConfig((configEnv) =>
  mergeConfig(createViteConfig(configEnv), {
    test: {
      environment: 'jsdom',
      setupFiles: ['./test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}', 'seo/**/*.{test,spec}.ts'],
      passWithNoTests: true,
      testTimeout: 10_000,
    },
  }),
)
