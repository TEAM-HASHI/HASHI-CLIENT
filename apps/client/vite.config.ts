import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vite'
import { alias, plugins as basePlugins } from './vite.shared'

const release =
  process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? 'local'

export default defineConfig({
  define: {
    'import.meta.env.VITE_VERCEL_ENV': JSON.stringify(
      process.env.VERCEL_ENV ?? 'development',
    ),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(release),
  },
  build: {
    sourcemap: process.env.SENTRY_AUTH_TOKEN ? 'hidden' : false,
  },
  resolve: {
    alias,
  },
  plugins: [
    ...basePlugins,
    ...(process.env.SENTRY_AUTH_TOKEN
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG!,
            project: process.env.SENTRY_PROJECT!,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            release: { name: release },
            sourcemaps: {
              filesToDeleteAfterUpload: ['./dist/**/*.map'],
            },
          }),
        ]
      : []),
  ],
})
