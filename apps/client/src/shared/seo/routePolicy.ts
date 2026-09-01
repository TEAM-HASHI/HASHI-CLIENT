import {
  createCanonicalUrl,
  createHomeSeoPage,
  createMagazineListSeoPage,
  createNoindexSeoPage,
  createNotFoundSeoPage,
  createRestaurantListSeoPage,
  SEO_DEFAULT_IMAGE,
} from '@/shared/seo/pageBuilders'
import type { SeoPage } from '@/shared/seo/types'

const INDEXABLE_RESTAURANT_PATTERN = /^\/restaurants\/[1-9]\d*$/
const INDEXABLE_MENU_PATTERN = /^\/restaurants\/[1-9]\d*\/menus\/[1-9]\d*$/
const PUBLIC_NOINDEX_PATTERNS = [
  /^\/search$/,
  /^\/restaurants\/today$/,
  /^\/map$/,
  /^\/coming-soon$/,
  /^\/magazines\/[^/]+$/,
]
const PRIVATE_NOINDEX_PATTERNS = [
  /^\/saved$/,
  /^\/mypage$/,
  /^\/profile\/new$/,
  /^\/withdrawal$/,
  /^\/my-reviews$/,
  /^\/my-reservations$/,
  /^\/login-required$/,
  /^\/oauth\/callback\/kakao$/,
  /^\/reviews\/[^/]+(?:\/edit)?$/,
  /^\/restaurants\/[^/]+\/reviews\/new$/,
  /^\/restaurants\/[^/]+\/reservations\/new$/,
  /^\/reservations\/(?:anywhere|request|[^/]+)$/,
]

const createDynamicLoadingFallback = (
  pathname: string,
  type: 'menu' | 'restaurant',
): SeoPage => {
  const isMenu = type === 'menu'
  const title = isMenu
    ? '일본 맛집 메뉴 정보 | HASHI'
    : '일본 맛집 정보·메뉴·예약 | HASHI'
  const description = isMenu
    ? '일본 맛집의 메뉴 정보와 가격을 확인하세요.'
    : '일본 맛집의 위치, 메뉴, 가격, 영업시간과 예약 정보를 확인하세요.'

  return {
    canonical: createCanonicalUrl(pathname),
    description,
    image: SEO_DEFAULT_IMAGE,
    robots: 'noindex, follow',
    snapshot: {
      heading: isMenu ? '메뉴 정보' : '식당 정보',
      links: [],
      summary: description,
    },
    structuredData: [],
    title,
    type: 'website',
  }
}

export const getRouteSeoFallback = (pathname: string): SeoPage => {
  if (pathname === '/') {
    return createHomeSeoPage({ restaurants: [] })
  }

  if (pathname === '/restaurants/hashi-pick') {
    return createRestaurantListSeoPage({
      restaurants: [],
      type: 'hashi-pick',
    })
  }

  if (pathname === '/restaurants/popular') {
    return createRestaurantListSeoPage({ restaurants: [], type: 'popular' })
  }

  if (pathname === '/magazines') {
    return createMagazineListSeoPage({ magazines: [] })
  }

  if (INDEXABLE_MENU_PATTERN.test(pathname)) {
    return createDynamicLoadingFallback(pathname, 'menu')
  }

  if (INDEXABLE_RESTAURANT_PATTERN.test(pathname)) {
    return createDynamicLoadingFallback(pathname, 'restaurant')
  }

  if (PUBLIC_NOINDEX_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return createNoindexSeoPage({
      description: '검색 결과에 포함하지 않는 HASHI 서비스 페이지입니다.',
      pathname,
      robots: 'noindex, follow',
      title: 'HASHI',
    })
  }

  if (PRIVATE_NOINDEX_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return createNoindexSeoPage({
      description: '사용자 전용 HASHI 서비스 페이지입니다.',
      pathname,
      robots: 'noindex, nofollow',
      title: 'HASHI',
    })
  }

  return createNotFoundSeoPage(pathname)
}
