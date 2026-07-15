import { mkdir, rename, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { loadEnv } from 'vite'

import { createPublicRouteManifest } from './public-route-manifest.mjs'

const appDirectory = process.cwd()
const mode =
  process.env.NODE_ENV === 'production' ? 'production' : 'development'
const loadedEnv = loadEnv(mode, appDirectory, '')
const apiBaseUrl = process.env.VITE_API_BASE_URL ?? loadedEnv.VITE_API_BASE_URL
const outputDirectory = resolve(appDirectory, '.seo')
const outputPath = resolve(outputDirectory, 'public-route-manifest.json')
const temporaryPath = `${outputPath}.tmp`

const manifest = await createPublicRouteManifest({
  apiBaseUrl,
  vercelEnv: process.env.VERCEL_ENV,
})

await mkdir(outputDirectory, { recursive: true })
await writeFile(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
await rename(temporaryPath, outputPath)

console.log(
  `[seo] 공개 경로 manifest 생성 완료: ${manifest.paths.length}개 경로`,
)
