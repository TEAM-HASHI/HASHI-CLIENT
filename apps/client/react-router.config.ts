import type { Config } from '@react-router/dev/config'

const STATIC_PRERENDER_PATHS = [
  '/',
  '/restaurants/hashi-pick',
  '/restaurants/popular',
  '/magazines',
]

export default {
  appDirectory: 'src',
  buildDirectory: 'dist',
  prerender: {
    paths: STATIC_PRERENDER_PATHS,
    concurrency: 4,
  },
  ssr: false,
} satisfies Config
