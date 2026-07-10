import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { alias, plugins as basePlugins } from './vite.shared'

const release =
  process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? 'local'

const getManualChunk = (id: string) => {
  if (!id.includes('node_modules')) {
    return undefined
  }

  if (id.includes('/react/') || id.includes('/react-dom/')) {
    return 'vendor-react'
  }

  if (id.includes('/react-router/') || id.includes('/react-router-dom/')) {
    return 'vendor-router'
  }

  if (id.includes('/@sentry/')) {
    return 'vendor-sentry'
  }

  if (id.includes('/@tanstack/')) {
    return 'vendor-query'
  }

  return 'vendor'
}

export default defineConfig({
  define: {
    'import.meta.env.VITE_VERCEL_ENV': JSON.stringify(
      process.env.VERCEL_ENV ?? 'development',
    ),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(release),
  },
  build: {
    sourcemap: process.env.SENTRY_AUTH_TOKEN ? 'hidden' : false,
    rollupOptions: {
      output: {
        manualChunks: getManualChunk,
      },
    },
  },
  resolve: {
    alias,
  },
  plugins: [
    ...basePlugins,
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'HASHI - 발견부터 예약까지',
        short_name: 'HASHI',
        description: '한국인 여행자를 위한 일본 맛집 큐레이션 및 예약 서비스',
        lang: 'ko',
        theme_color: '#273033',
        background_color: '#F2F7F9',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,gif,woff,woff2}'],
        globIgnores: ['icons/pwa-*.png'],
      },
    }),
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
