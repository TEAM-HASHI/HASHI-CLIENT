import { describe, expect, it } from 'vitest'

import { getRouteSeoFallback } from '@/shared/seo/routePolicy'

describe('getRouteSeoFallback', () => {
  it.each([
    '/',
    '/restaurants/hashi-pick',
    '/restaurants/popular',
    '/magazines',
  ])('keeps an indexable fallback for %s', (pathname) => {
    expect(getRouteSeoFallback(pathname).robots).toBe('index, follow')
  })

  it.each(['/restaurants/123', '/restaurants/123/menus/10'])(
    'keeps a valid dynamic route noindex until API data is ready for %s',
    (pathname) => {
      expect(getRouteSeoFallback(pathname)).toMatchObject({
        canonical: `https://www.hashi.kr${pathname}`,
        robots: 'noindex, follow',
      })
    },
  )

  it.each([
    '/search',
    '/restaurants/today',
    '/map',
    '/coming-soon',
    '/magazines/10',
  ])('uses noindex, follow for public utility route %s', (pathname) => {
    expect(getRouteSeoFallback(pathname).robots).toBe('noindex, follow')
  })

  it.each([
    '/saved',
    '/mypage',
    '/profile/new',
    '/restaurants/10/reservations/new',
    '/reviews/20/edit',
    '/oauth/callback/kakao',
  ])('uses noindex, nofollow for private route %s', (pathname) => {
    expect(getRouteSeoFallback(pathname).robots).toBe('noindex, nofollow')
  })

  it('uses not-found metadata for unknown paths and non-positive IDs', () => {
    expect(getRouteSeoFallback('/unknown')).toMatchObject({
      robots: 'noindex, nofollow',
      title: '페이지를 찾을 수 없습니다 | HASHI',
    })
    expect(getRouteSeoFallback('/restaurants/0').robots).toBe(
      'noindex, nofollow',
    )
  })
})
