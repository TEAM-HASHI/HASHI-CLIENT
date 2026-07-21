import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

interface VercelConfig {
  headers?: Array<{
    source: string
    headers: Array<{ key: string; value: string }>
  }>
}

const workerPath = resolve(process.cwd(), 'public/sw.js')
const vercelConfigPath = resolve(process.cwd(), '../../vercel.admin.json')

describe('legacy PWA deployment cleanup', () => {
  it('ships a self-destroying worker at the original service worker path', () => {
    expect(existsSync(workerPath)).toBe(true)

    const workerSource = readFileSync(workerPath, 'utf8')

    expect(workerSource).toContain("self.addEventListener('install'")
    expect(workerSource).toContain('self.skipWaiting()')
    expect(workerSource).toContain('self.registration.unregister()')
    expect(workerSource).toContain('self.caches.delete(cacheName)')
  })

  it('prevents the cleanup worker from being cached by browsers or the CDN', () => {
    const config = JSON.parse(
      readFileSync(vercelConfigPath, 'utf8'),
    ) as VercelConfig
    const workerHeaders = config.headers?.find(
      ({ source }) => source === '/sw.js',
    )

    expect(workerHeaders?.headers).toEqual(
      expect.arrayContaining([
        { key: 'Cache-Control', value: 'no-store, max-age=0' },
        { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
      ]),
    )
  })
})
