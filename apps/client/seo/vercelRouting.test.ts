// @vitest-environment node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

interface VercelConfig {
  cleanUrls?: boolean
  rewrites?: Array<{ destination: string; source: string }>
  trailingSlash?: boolean
}

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
  it('routes known SPA pages to noindex shells without hiding generated pages', async () => {
    const config = JSON.parse(
      await readFile(resolve(process.cwd(), '../../vercel.json'), 'utf8'),
    ) as VercelConfig
    const rewrites = config.rewrites ?? []

    expect(config.cleanUrls).toBe(true)
    expect(config.trailingSlash).toBe(false)
    expect(rewrites).not.toContainEqual({
      destination: '/',
      source: '/(.*)',
    })

    publicNoindexRoutes.forEach((source) => {
      expect(rewrites).toContainEqual({
        destination: '/public-noindex-shell',
        source,
      })
    })
    privateNoindexRoutes.forEach((source) => {
      expect(rewrites).toContainEqual({
        destination: '/private-noindex-shell',
        source,
      })
    })

    expect(
      rewrites.some(({ source }) => source === '/restaurants/:restaurantId'),
    ).toBe(false)
    expect(
      rewrites.some(
        ({ source }) => source === '/restaurants/:restaurantId/menus/:menuId',
      ),
    ).toBe(false)
  })
})
