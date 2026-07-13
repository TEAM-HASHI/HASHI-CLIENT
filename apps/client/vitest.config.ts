import { mergeConfig } from 'vitest/config'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      passWithNoTests: true,
      testTimeout: 10_000,
    },
  }),
)
