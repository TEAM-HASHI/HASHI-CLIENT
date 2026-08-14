// @vitest-environment node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

interface VercelConfig {
  cleanUrls?: boolean
  rewrites?: Array<{ destination: string; source: string }>
  trailingSlash?: boolean
}

const indexableRoutes = [
  { destination: '/index.html', source: '/' },
  {
    destination: '/restaurants/hashi-pick/index.html',
    source: '/restaurants/hashi-pick',
  },
  {
    destination: '/restaurants/popular/index.html',
    source: '/restaurants/popular',
  },
  { destination: '/magazines/index.html', source: '/magazines' },
  {
    destination: '/restaurants/:restaurantId/menus/:menuId/index.html',
    source: '/restaurants/:restaurantId/menus/:menuId',
  },
  {
    destination: '/restaurants/:restaurantId/index.html',
    source: '/restaurants/:restaurantId',
  },
]

const publicNoindexRoutes = [
  '/search',
  '/restaurants/today',
  '/map',
  '/coming-soon',
  '/magazines/:magazineId',
]

const privateNoindexRoutes = [
  '/restaurants/:restaurantId/reviews/new',
  '/reviews/:reviewId/edit',
  '/reviews/:reviewId',
  '/restaurants/:restaurantId/reservations/new',
  '/reservations/anywhere',
  '/reservations/request',
  '/reservations/:reservationId',
  '/my-reviews',
  '/saved',
  '/mypage',
  '/my-reservations',
  '/profile/new',
  '/withdrawal',
  '/login-required',
  '/oauth/callback/kakao',
]

describe('Vercel SEO routing', () => {
  it('maps canonical indexable URLs to generated directory index documents', async () => {
    const config = JSON.parse(
      await readFile(resolve(process.cwd(), '../../vercel.json'), 'utf8'),
    ) as VercelConfig
    const rewrites = config.rewrites ?? []

    expect(config.cleanUrls).toBe(false)
    expect(config.trailingSlash).toBe(false)
    expect(rewrites).not.toContainEqual({
      destination: '/',
      source: '/(.*)',
    })

    indexableRoutes.forEach((rewrite) => {
      expect(rewrites).toContainEqual(rewrite)
    })
  })

  it('routes known SPA pages to generated noindex shell documents', async () => {
    const config = JSON.parse(
      await readFile(resolve(process.cwd(), '../../vercel.json'), 'utf8'),
    ) as VercelConfig
    const rewrites = config.rewrites ?? []

    publicNoindexRoutes.forEach((source) => {
      expect(rewrites).toContainEqual({
        destination: '/public-noindex-shell.html',
        source,
      })
    })
    privateNoindexRoutes.forEach((source) => {
      expect(rewrites).toContainEqual({
        destination: '/private-noindex-shell.html',
        source,
      })
    })
  })
})
