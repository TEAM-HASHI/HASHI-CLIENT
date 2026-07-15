import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Config } from '@react-router/dev/config'

const STATIC_PRERENDER_PATHS = [
  '/',
  '/restaurants/hashi-pick',
  '/restaurants/popular',
  '/magazines',
]

const readPrerenderPaths = () => {
  const manifestPath = resolve(process.cwd(), '.seo/public-route-manifest.json')

  if (!existsSync(manifestPath)) {
    return STATIC_PRERENDER_PATHS
  }

  const manifest: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'))

  if (
    typeof manifest !== 'object' ||
    manifest === null ||
    !('paths' in manifest) ||
    !Array.isArray(manifest.paths) ||
    !manifest.paths.every((path) => typeof path === 'string')
  ) {
    throw new Error('공개 경로 manifest 형식이 올바르지 않습니다.')
  }

  return manifest.paths
}

export default {
  appDirectory: 'src',
  buildDirectory: 'dist',
  prerender: {
    paths: [...readPrerenderPaths(), '/robots.txt', '/sitemap.xml'],
    concurrency: 4,
  },
  ssr: false,
} satisfies Config
