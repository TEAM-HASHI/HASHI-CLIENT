import { expect, test } from '@playwright/test'

const initialBounds = { north: 35.73, south: 35.64, west: 139.68, east: 139.81 }
const regionFixtures = [
  { mapRegionId: 1, name: '신주쿠', lat: 35.6938, lng: 139.7034 },
  { mapRegionId: 2, name: '시부야', lat: 35.6595, lng: 139.7005 },
  { mapRegionId: 3, name: '긴자', lat: 35.6717, lng: 139.765 },
  { mapRegionId: 4, name: '우에노', lat: 35.7142, lng: 139.7774 },
  { mapRegionId: 5, name: '아사쿠사', lat: 35.7148, lng: 139.7967 },
]
const photoPaths = [1, 2, 3].map(
  (index) => `/src/shared/assets/images/map/preview/tonkatsu-${index}.webp`,
)
const restaurantFixtures = [
  {
    restaurantId: 1,
    name: '코코네 돈카츠 신도심점',
    mapRegionId: 1,
    placeType: 'restaurant',
    rating: 4.8,
    lat: 35.694,
    lng: 139.703,
  },
  {
    restaurantId: 2,
    name: '야키니쿠 리키마루',
    mapRegionId: 2,
    placeType: 'restaurant',
    rating: 4.8,
    lat: 35.6605,
    lng: 139.7015,
  },
  {
    restaurantId: 3,
    name: '카츠카츠',
    mapRegionId: 4,
    placeType: 'restaurant',
    rating: 4.6,
    lat: 35.715,
    lng: 139.778,
  },
  {
    restaurantId: 4,
    name: '히마와리 스시 신도심점',
    mapRegionId: 3,
    placeType: 'restaurant',
    rating: 4.9,
    lat: 35.672,
    lng: 139.765,
  },
  {
    restaurantId: 5,
    name: '도쿄 카페 미리보기',
    mapRegionId: 2,
    placeType: 'cafe',
    rating: 4.5,
    lat: 35.6585,
    lng: 139.6995,
  },
  {
    restaurantId: 6,
    name: '아사쿠사 주점 미리보기',
    mapRegionId: 5,
    placeType: 'bar',
    rating: 4.7,
    lat: 35.7145,
    lng: 139.7965,
  },
  {
    restaurantId: 7,
    name: '도쿄 야키니쿠',
    mapRegionId: 1,
    placeType: 'restaurant',
    rating: 4.3,
    lat: 35.6955,
    lng: 139.705,
  },
].map(({ lat, lng, ...restaurant }) => ({
  ...restaurant,
  reviewCount: 124,
  genre: 'japanese',
  imageUrls: photoPaths,
  location: {
    latitude: lat,
    longitude: lng,
    validUntil: '2099-01-01T00:00:00Z',
    attributions: [
      { displayName: '좌표 제공자', uri: 'https://example.com/credits' },
    ],
  },
}))

test.beforeEach(async ({ page }) => {
  // The Google SDK stays real; deterministic server JSON exercises the API boundary.
  let lastQuery: Record<string, string | number> = {
    ...initialBounds,
    sort: 'recommend',
  }
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url())
    const fulfill = (data: unknown) =>
      route.fulfill({
        status: 200,
        json: { success: true, code: 'SUCCESS', message: 'ok', data },
      })
    if (url.pathname.endsWith('/restaurants/save-counts'))
      return fulfill({
        restaurants: (url.searchParams.get('restaurantIds') ?? '')
          .split(',')
          .filter(Boolean)
          .map((id) => ({ restaurantId: Number(id), saveCount: 3 })),
      })
    if (url.pathname.endsWith('/users/me/restaurant-saves'))
      return fulfill({ restaurants: [] })
    if (url.pathname.endsWith('/restaurants/map/regions'))
      return fulfill({
        initialBounds,
        queryLimits: {
          supportedBounds: { north: 40, south: 30, west: 130, east: 150 },
          maxLatitudeSpan: 2,
          maxLongitudeSpan: 2,
        },
        regions: regionFixtures.map(({ lat, lng, ...region }) => ({
          ...region,
          restaurantCount: restaurantFixtures.filter(
            ({ mapRegionId }) => mapRegionId === region.mapRegionId,
          ).length,
          clusterPosition: { latitude: lat, longitude: lng },
          cameraBounds: {
            north: lat + 0.01,
            south: lat - 0.01,
            west: lng - 0.01,
            east: lng + 0.01,
          },
          displayOrder: region.mapRegionId,
        })),
      })
    if (url.pathname.endsWith('/restaurants/map')) {
      const params = Object.fromEntries(url.searchParams)
      const query: Record<string, string | number> = params.querySessionId
        ? { ...lastQuery, sort: params.sort }
        : {
            ...params,
            ...(params.mapRegionId
              ? { mapRegionId: Number(params.mapRegionId) }
              : {}),
            south: Number(params.south),
            north: Number(params.north),
            west: Number(params.west),
            east: Number(params.east),
          }
      lastQuery = query
      const content = restaurantFixtures
        .filter(
          (restaurant) =>
            (!query.mapRegionId ||
              restaurant.mapRegionId === query.mapRegionId) &&
            (!query.placeType ||
              query.placeType === 'all' ||
              restaurant.placeType === query.placeType) &&
            (!query.keyword || restaurant.name.includes(String(query.keyword))),
        )
        .sort((left, right) =>
          query.sort === 'rating'
            ? right.rating - left.rating
            : left.restaurantId - right.restaurantId,
        )
      return fulfill({
        content,
        hasNext: false,
        querySessionId: '123e4567-e89b-12d3-a456-426614174000',
        expiresAt: '2099-01-01T00:00:00Z',
        rankingAsOf: '2026-10-19T00:00:00Z',
        query,
        ...(query.keyword
          ? {
              searchResult: {
                totalCount: content.length,
                bounds: content.length
                  ? {
                      north: Math.max(
                        ...content.map(({ location }) => location.latitude),
                      ),
                      south: Math.min(
                        ...content.map(({ location }) => location.latitude),
                      ),
                      west: Math.min(
                        ...content.map(({ location }) => location.longitude),
                      ),
                      east: Math.max(
                        ...content.map(({ location }) => location.longitude),
                      ),
                    }
                  : null,
              },
            }
          : {}),
      })
    }
    const match = url.pathname.match(
      /\/restaurants\/(\d+)\/(map-location|summary|store-information|menus|reviews|photos)$/,
    )
    if (match) {
      const restaurantId = Number(match[1])
      const restaurant = restaurantFixtures.find(
        (item) => item.restaurantId === restaurantId,
      )
      if (!restaurant) return route.fulfill({ status: 404, json: {} })
      if (match[2] === 'map-location')
        return fulfill({ restaurantId, location: restaurant.location })
      if (match[2] === 'summary')
        return fulfill({ ...restaurant, address: '도쿄', reservationFee: 0 })
      if (match[2] === 'photos') {
        const filter = url.searchParams.get('filter') ?? 'ALL'
        const isEmpty = filter === 'MENU'
        return fulfill({
          restaurantId,
          filter,
          counts: { all: 3, representative: 3, menu: 0, review: 0 },
          totalCount: isEmpty ? 0 : 3,
          photos: isEmpty
            ? []
            : photoPaths.map((imageUrl, index) => ({
                photoId: `REPRESENTATIVE:${index + 1}`,
                type: 'REPRESENTATIVE',
                imageUrl,
                image: null,
              })),
          hasNext: false,
          nextCursor: null,
        })
      }
      if (match[2] === 'store-information')
        return fulfill({
          restaurantId,
          description: '도쿄에서 즐기는 식당입니다. '.repeat(40),
          businessHours: [],
        })
      return fulfill({
        restaurantId,
        content: [],
        hasNext: false,
        averageRating: restaurant.rating,
        reviewCount: 0,
      })
    }
    return route.fulfill({ status: 401, json: {} })
  })
  await page.setViewportSize({ width: 393, height: 852 })
  await page.goto('/map')
  await expect(
    page.getByRole('heading', { name: '도쿄 맛집 지도' }),
  ).toBeVisible()
})

test('exposed map, category and search receive real pointer clicks', async ({
  page,
}) => {
  await page.getByRole('button', { name: '신주쿠 식당 보기' }).click()
  await expect(
    page.getByRole('button', { name: '코코네 돈카츠 신도심점 지도 마커' }),
  ).toBeVisible()
  await page.getByRole('button', { name: '전체 지역 보기' }).click()
  await page.getByRole('button', { name: '카페', exact: true }).click()
  await expect(
    page.getByRole('button', { name: '도쿄 카페 미리보기 상세 보기' }),
  ).toBeVisible()
  await page.getByRole('searchbox').click()
  await expect(page).toHaveURL(/\/search$/)
  await page.getByRole('searchbox').fill('없는 식당')
  await page.getByRole('searchbox').press('Enter')
  await expect(page.getByRole('alert')).toContainText(
    '조건에 맞는 맛집이 없어요.',
  )
  await expect(
    page.getByRole('region', { name: '지도 식당 목록' }).getByRole('status'),
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: '검색 조건 초기화' }),
  ).toHaveCount(0)
  const handle = page.getByRole('slider', { name: '식당 목록 높이 조절' })
  await expect(handle).toHaveAttribute('aria-valuenow', '30')
  await handle.press('End')
  await expect(handle).toHaveAttribute('aria-valuenow', '30')
  await page.screenshot({
    path: test.info().outputPath('figma-empty-toast-handle.png'),
  })
  await page.getByRole('button', { name: '지도 검색어 지우기' }).click()
  await page.getByRole('button', { name: '전체', exact: true }).click()
  await expect(
    page.getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' }),
  ).toBeVisible()
})

test('direct zoom reveals pins and zoom-out restores regions without filters', async ({
  page,
}) => {
  const area = page.getByRole('button', { name: '신주쿠 식당 보기' })
  const pins = page.getByRole('button', { name: /지도 마커$/ })
  await expect(area).toBeVisible()
  await expect(pins).toHaveCount(0)
  await page.mouse.move(195, 300)
  await expect
    .poll(
      async () => {
        await page.mouse.wheel(0, -800)
        return pins.count()
      },
      { timeout: 15000, intervals: [400] },
    )
    .toBeGreaterThan(0)
  await expect(area).toHaveCount(0)
  // Repeated wheel steps exercise Google Maps' incremental gesture zoom.
  for (let step = 0; step < 12; step++) {
    await page.mouse.wheel(0, 800)
    await page.waitForTimeout(200)
  }
  await expect(area).toBeVisible()
  await expect(pins).toHaveCount(0)
})

test('list header stays fixed while results scroll without a map CTA or visible scrollbar', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const handle = page.getByRole('slider', { name: '식당 목록 높이 조절' })
  await handle.press('End')
  await expect(page.getByRole('button', { name: '지도로 보기' })).toHaveCount(0)
  const panel = page.getByRole('region', {
    name: '지도 식당 목록',
    exact: true,
  })
  const heading = panel.getByRole('heading', {
    name: '지금 도쿄에서 제일 핫한 맛집',
  })
  const sort = panel.getByRole('button', { name: '정렬: 추천순' })
  const topBefore = await heading.boundingBox()
  const sortBefore = await sort.boundingBox()
  const scroller = panel.locator('.overflow-y-auto')
  await scroller.evaluate((element) => {
    element.scrollTop = 300
  })
  await expect
    .poll(() => scroller.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0)
  await expect(heading).toBeInViewport()
  expect((await heading.boundingBox())!.y).toBeCloseTo(topBefore!.y, 0)
  expect((await sort.boundingBox())!.y).toBeCloseTo(sortBefore!.y, 0)
  await expect(scroller).toHaveCSS('scrollbar-width', 'none')
  await page.screenshot({
    path: test.info().outputPath('hashi245-fixed-list-header.png'),
  })
  await sort.click()
  await expect(
    page.getByRole('menuitemradio', { name: '별점순' }),
  ).toBeVisible()
  await page
    .getByRole('menu', { name: '식당 정렬' })
    .screenshot({ path: test.info().outputPath('hashi245-sort-menu.png') })
  await page.getByRole('menuitemradio', { name: '별점순' }).press('Escape')
  await handle.press('Home')
  await expect(handle).toHaveAttribute('aria-valuenow', '30')
  await expect(handle).toBeFocused()
  await handle.press('ArrowUp')
  await expect(page.getByRole('list', { name: '식당 검색 결과' })).toBeVisible()
})

test('restaurant metadata and card whitespace open detail, while saving does not select the restaurant', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('slider', { name: '식당 목록 높이 조절' }).press('End')
  const card = page
    .getByRole('list', { name: '식당 검색 결과' })
    .getByRole('article')
    .first()
  const metadata = await card
    .getByText('도쿄 · japanese', { exact: true })
    .boundingBox()
  expect(metadata).not.toBeNull()
  await page.mouse.click(
    metadata!.x + metadata!.width / 2,
    metadata!.y + metadata!.height / 2,
  )
  await expect(
    page.getByRole('region', { name: '선택한 식당 요약' }),
  ).toBeVisible()
  await page.getByRole('button', { name: '선택한 식당 닫기' }).click()
  const box = await card.boundingBox()
  await page.mouse.click(box!.x + 4, box!.y + 8)
  await expect(
    page.getByRole('region', { name: '선택한 식당 요약' }),
  ).toBeVisible()
  await page.getByRole('button', { name: '선택한 식당 닫기' }).click()
  await card
    .getByRole('button', { name: '코코네 돈카츠 신도심점 저장' })
    .click()
  await expect(page).toHaveURL(/\/login-required$/)
})

test('photo strips scroll horizontally when the gesture starts between thumbnails', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('slider', { name: '식당 목록 높이 조절' }).press('End')
  const strip = page.getByLabel('코코네 돈카츠 신도심점 사진', { exact: true })
  const photo = await strip.getByRole('button').first().boundingBox()
  expect(photo).not.toBeNull()
  await page.mouse.move(photo!.x + photo!.width + 4, photo!.y + 10)
  await page.mouse.wheel(120, 0)
  await expect
    .poll(() => strip.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0)
  await expect(
    page.getByRole('region', { name: '선택한 식당 요약' }),
  ).toHaveCount(0)
  await expect(strip).toHaveCSS('scrollbar-width', 'none')
  await strip.getByRole('button').first().press('Enter')
  await expect(
    page.getByRole('region', { name: '선택한 식당 요약' }),
  ).toBeVisible()
})

test('overview zoom clears category, restores regions and reloads the list', async ({
  page,
}) => {
  await page.getByRole('button', { name: '카페', exact: true }).click()
  await expect(page.getByText('지도를 불러오고 있어요.')).toBeHidden()
  await expect(
    page.getByRole('button', { name: '도쿄 카페 미리보기 지도 마커' }),
  ).toBeVisible()
  await page.mouse.move(195, 280)
  await page.mouse.wheel(0, -500)
  const handle = page.getByRole('slider', { name: '식당 목록 높이 조절' })
  await expect(handle).toHaveAttribute('aria-valuenow', '30')
  await expect(
    page.getByRole('button', { name: '현재 위치에서 검색' }),
  ).toBeVisible()
  await expect
    .poll(
      async () => {
        if (
          (await page
            .getByRole('button', { name: '전체', exact: true })
            .getAttribute('aria-pressed')) === 'true'
        )
          return true
        await page.mouse.wheel(0, 800)
        return false
      },
      { timeout: 15000, intervals: [400] },
    )
    .toBe(true)
  await expect(
    page.getByRole('button', { name: '신주쿠 식당 보기' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: '카페', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false')
  await expect(handle).not.toHaveAttribute('aria-valuenow', '30')
})

test('unfiltered map movement offers explicit viewport search without auto-querying', async ({
  page,
}) => {
  await expect(
    page.getByRole('button', { name: '신주쿠 식당 보기' }),
  ).toBeVisible()
  await expect(page.getByText('지도를 불러오고 있어요.')).toBeHidden()
  const search = page.getByRole('button', { name: '현재 위치에서 검색' })
  await expect(search).toHaveCount(0)
  // Server initialBounds can place a region button at the old fixed drag point.
  // Start on uncovered map tiles, not a clickable label that selects a region.
  const point = await page
    .getByRole('region', { name: '도쿄 맛집 지도', exact: true })
    .evaluate((element) => {
      const rect = element.getBoundingClientRect()
      for (const y of [240, 300, 360]) {
        for (const x of [60, 140, 260, 330]) {
          const target = document.elementFromPoint(rect.left + x, rect.top + y)
          if (
            target &&
            element.contains(target) &&
            !target.closest('button, [role="button"], a, aside')
          )
            return { x: rect.left + x, y: rect.top + y }
        }
      }
      throw new Error('No unobstructed map drag point')
    })
  let queries = 0
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/v1/restaurants/map') queries++
  })
  await page.mouse.move(point.x, point.y)
  await page.mouse.down()
  await page.mouse.move(point.x + 40, point.y + 40, { steps: 12 })
  await page.mouse.up()
  await expect(search).toBeVisible()
  expect(queries).toBe(0)
  await page.screenshot({
    path: test.info().outputPath('unfiltered-viewport-search.png'),
  })
  await expect(
    page.getByRole('slider', { name: '식당 목록 높이 조절' }),
  ).toHaveAttribute('aria-valuenow', '30')
  await search.click()
  await expect.poll(() => queries).toBe(1)
  await expect(search).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: '전체', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
})

test('panning a category at the initial scale preserves the filter until explicit search', async ({
  page,
}) => {
  await expect(page.getByText('지도를 불러오고 있어요.')).toBeHidden()
  const cafe = page.getByRole('button', { name: '카페', exact: true })
  await cafe.click()
  await expect(
    page.getByRole('button', { name: '도쿄 카페 미리보기 지도 마커' }),
  ).toBeVisible()
  await page.mouse.move(195, 270)
  await page.mouse.down()
  await page.mouse.move(235, 310, { steps: 12 })
  await page.mouse.up()
  await expect(
    page.getByRole('button', { name: '현재 위치에서 검색' }),
  ).toBeVisible()
  await expect(cafe).toHaveAttribute('aria-pressed', 'true')
  await expect(
    page.getByRole('slider', { name: '식당 목록 높이 조절' }),
  ).toHaveAttribute('aria-valuenow', '30')
})

test('search round trip retains category and clear removes only keyword', async ({
  page,
}) => {
  await page.getByRole('button', { name: '카페', exact: true }).click()
  await page.getByRole('searchbox').click()
  await expect(page).toHaveURL(/\/search$/)
  await page.getByRole('searchbox').fill('카페')
  await page.getByRole('searchbox').press('Enter')
  await expect(page).toHaveURL(/\/map$/)
  await expect(
    page.getByRole('button', { name: '카페', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: '지도 검색어 지우기' }).click()
  await expect(page.getByRole('searchbox')).toHaveValue('')
  await expect(
    page.getByRole('button', { name: '카페', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
})

test('SDK failure exposes a keyboard-operable retry', async ({ page }) => {
  await page.route('**/maps.googleapis.com/maps/api/js*', (route) =>
    route.abort(),
  )
  await page.reload()
  await expect(page.getByText('지도를 불러오지 못했어요!')).toBeVisible({
    timeout: 20000,
  })
  const retry = page.getByRole('button', { name: '다시 시도하기' })
  await retry.focus()
  await expect(retry).toBeFocused()
  await page.unroute('**/maps.googleapis.com/maps/api/js*')
  await retry.press('Enter')
  await expect(
    page.getByRole('button', { name: '신주쿠 식당 보기' }),
  ).toBeVisible()
})

test('initial list loading shows card skeletons without interactive controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 807 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/api/v1/restaurants/map?*', async (route) => {
    await pending
    await route.fallback()
  })
  await page.reload()
  try {
    const panel = page.getByRole('region', {
      name: '지도 식당 목록',
      exact: true,
    })
    const loading = panel.getByRole('status', { name: '식당 목록 로딩 중' })
    await expect(loading.locator('article')).toHaveCount(3)
    await expect(panel.getByRole('heading')).toHaveCount(0)
    await expect(panel.getByRole('button', { name: /정렬/ })).toHaveCount(0)
    await expect(loading.locator('img')).toHaveCount(0)
    await page.screenshot({
      path: test.info().outputPath('figma-loading-panel.png'),
    })
  } finally {
    release()
  }
  await expect(page.getByRole('list', { name: '식당 검색 결과' })).toBeVisible()
})

test('selected restaurant loading uses the spinner, and moving the map collapses detail without losing selection', async ({
  page,
}) => {
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/api/v1/restaurants/1/summary', async (route) => {
    await pending
    await route.fallback()
  })
  await page
    .getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' })
    .click()
  const panel = page.getByRole('region', { name: '선택한 식당', exact: true })
  try {
    await expect(panel.getByRole('status')).toHaveText(
      '식당 정보를 불러오고 있어요.',
    )
    await expect(panel.getByRole('heading')).toHaveCount(0)
    const spinner = panel.locator('[role="status"] img')
    await expect(spinner).toHaveCSS('width', '80px')
    await expect(spinner).toHaveCSS('height', '80px')
    await page.screenshot({
      path: test.info().outputPath('figma-selected-loading.png'),
    })
  } finally {
    release()
  }
  await expect(
    panel.getByRole('heading', { name: '코코네 돈카츠 신도심점' }),
  ).toBeVisible()
  await expect(page.getByText('지도를 불러오고 있어요.')).toBeHidden()
  const map = page.getByRole('region', { name: '도쿄 맛집 지도', exact: true })
  const point = await map.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    for (const y of [240, 300, 360])
      for (const x of [60, 140, 260, 330]) {
        const target = document.elementFromPoint(rect.left + x, rect.top + y)
        if (
          target &&
          element.contains(target) &&
          !target.closest('button, [role="button"], a, aside')
        )
          return { x: rect.left + x, y: rect.top + y }
      }
    throw new Error('No unobstructed map drag point')
  })
  await page.mouse.move(point.x, point.y)
  await page.mouse.down()
  await page.mouse.move(point.x + 40, point.y + 40, { steps: 12 })
  await page.mouse.up()
  await expect(
    page.getByRole('slider', { name: '식당 상세 높이 조절' }),
  ).toHaveAttribute('aria-valuenow', '30')
  await expect(
    page.getByRole('button', { name: '선택한 식당 닫기' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: '코코네 돈카츠 신도심점 지도 마커' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(
    page.getByRole('button', { name: '현재 위치에서 검색' }),
  ).toBeVisible()
})

test('next-page loading keeps loaded restaurants and appends a card skeleton', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/api/v1/restaurants/map?*', async (route) => {
    const url = new URL(route.request().url())
    const isNext = url.searchParams.has('cursor')
    if (isNext) await pending
    await route.fulfill({
      status: 200,
      json: {
        success: true,
        code: 'SUCCESS',
        message: 'ok',
        data: {
          content: [restaurantFixtures[isNext ? 1 : 0]],
          hasNext: !isNext,
          nextCursor: isNext ? null : 'next-page',
          querySessionId: '123e4567-e89b-12d3-a456-426614174000',
          expiresAt: '2099-01-01T00:00:00Z',
          rankingAsOf: '2026-10-19T00:00:00Z',
          query: { ...initialBounds, sort: 'recommend' },
        },
      },
    })
  })
  await page.reload()
  const panel = page.getByRole('region', {
    name: '지도 식당 목록',
    exact: true,
  })
  try {
    await expect(panel.getByRole('listitem')).toHaveCount(1)
    await page.getByRole('slider', { name: '식당 목록 높이 조절' }).press('End')
    const loading = panel.getByRole('status', { name: '식당 목록 로딩 중' })
    await expect(loading.locator('article')).toHaveCount(1)
    await expect(
      panel.getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' }),
    ).toBeVisible()
    await expect(loading.locator('img')).toHaveCount(0)
    await page.screenshot({
      path: test.info().outputPath('figma-next-page-loading.png'),
    })
  } finally {
    release()
  }
  await expect(panel.getByRole('listitem')).toHaveCount(2)
  await expect(panel.getByRole('status')).toHaveCount(0)
})

test('regions configuration failure never falls back to sample pins or restaurant results', async ({
  page,
}) => {
  await page.route('**/api/v1/restaurants/map/regions', (route) =>
    route.fulfill({
      status: 503,
      json: {
        success: false,
        code: 'RESTAURANT-017',
        message: '지도 설정이 준비되지 않았습니다.',
        data: null,
        timestamp: '2026-10-19T00:00:00Z',
        path: '/api/v1/restaurants/map/regions',
      },
    }),
  )
  await page.reload()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(
    page.getByRole('button', { name: '신주쿠 식당 보기' }),
  ).toHaveCount(0)
  await expect(page.getByRole('list', { name: '식당 검색 결과' })).toHaveCount(
    0,
  )
  await expect(
    page.getByRole('button', { name: '다시 시도하기' }),
  ).toBeVisible()
})

test('coordinate credits stay above floating controls on a narrow viewport', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 320, height: 640 })
  await page.getByRole('button', { name: '카페', exact: true }).click()
  const credits = page.getByRole('complementary', { name: '지도 좌표 출처' })
  await expect(credits).toBeVisible()
  await expect(
    credits.getByRole('link', { name: '좌표 제공자' }),
  ).toHaveAttribute('href', 'https://example.com/credits')
  const creditBox = await credits.boundingBox()
  const savedBox = await page
    .getByRole('button', { name: '저장 목록 보기' })
    .boundingBox()
  expect(creditBox).not.toBeNull()
  expect(savedBox).not.toBeNull()
  expect(creditBox!.y + creditBox!.height).toBeLessThanOrEqual(savedBox!.y)
  expect(creditBox!.x + creditBox!.width).toBeLessThanOrEqual(320)
})

test('dragging the handle expands the sheet and body scroll survives collapse', async ({
  page,
}) => {
  const handle = page.getByRole('slider', { name: '식당 목록 높이 조절' })
  await handle.click({ trial: true })
  const box = await handle.boundingBox()
  if (!box) throw new Error('Missing handle')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, 40, { steps: 12 })
  await page.mouse.up()
  await expect(handle).toHaveAttribute('aria-valuenow', '710')
  const list = page.getByRole('list', { name: '식당 검색 결과' })
  const scroller = list.locator('..').locator('..')
  await scroller.evaluate((element) => {
    element.scrollTop = 180
  })
  await expect
    .poll(() => scroller.evaluate((element) => element.scrollTop))
    .toBe(180)
  await handle.press('Home')
  await handle.press('ArrowUp')
  await expect
    .poll(() => scroller.evaluate((element) => element.scrollTop))
    .toBe(180)
  await page.getByRole('button', { name: '카페', exact: true }).click()
  await expect
    .poll(() =>
      page
        .getByRole('list', { name: '식당 검색 결과' })
        .locator('..')
        .locator('..')
        .evaluate((element) => element.scrollTop),
    )
    .toBe(0)
})

test('expanded detail contains focus, has sticky headings and restores the photo trigger', async ({
  page,
}) => {
  await page
    .getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' })
    .click()
  await page.getByRole('slider', { name: '식당 상세 높이 조절' }).press('End')
  const detail = page.getByRole('dialog', {
    name: '코코네 돈카츠 신도심점 전체 상세',
  })
  await expect(detail).toBeVisible()
  await expect
    .poll(() =>
      page
        .locator('nav')
        .evaluate(
          (element) => !!element.closest('[inert], [aria-hidden="true"]'),
        ),
    )
    .toBe(true)
  await page.keyboard.press('Shift+Tab')
  await expect(detail.getByRole('button', { name: '예약하기' })).toBeFocused()
  const thumbnail = page.getByRole('button', {
    name: '코코네 돈카츠 신도심점 사진 2 보기',
  })
  await thumbnail.click()
  const viewer = page.getByRole('dialog', { name: '식당 사진 상세보기' })
  await expect(viewer).toBeVisible()
  await expect(
    viewer.getByRole('group', { name: '2 / 3', exact: true }),
  ).toBeInViewport({ ratio: 0.9 })
  await page.keyboard.press('Escape')
  await expect(viewer).toHaveCount(0)
  await expect(thumbnail).toBeFocused()
  const panel = detail.getByRole('region', { name: '선택한 식당', exact: true })
  const body = panel.locator('.overflow-y-auto')
  await body.evaluate((element) => {
    element.scrollTop = 450
  })
  await expect(
    detail.getByRole('heading', {
      name: '코코네 돈카츠 신도심점',
      exact: true,
    }),
  ).toBeInViewport()
  await expect(detail.getByRole('tab', { name: '매장 정보' })).toBeInViewport()
  await expect(
    detail.getByRole('button', { name: '예약하기' }),
  ).toBeInViewport()
  await page.getByRole('button', { name: '식당 상세 닫기' }).click()
  await expect(page.getByRole('button', { name: '정렬: 추천순' })).toBeFocused()
})

test('API photo gallery keeps the expanded sheet open after closing its viewer and resets filters', async ({
  page,
}) => {
  await page
    .getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' })
    .click()
  await page.getByRole('slider', { name: '식당 상세 높이 조절' }).press('End')
  const detail = page.getByRole('dialog', {
    name: '코코네 돈카츠 신도심점 전체 상세',
  })
  await detail.getByRole('tab', { name: /^사진/ }).click()
  const panel = detail.getByRole('tabpanel', { name: '사진' })
  const photo = panel.getByRole('button', { name: '2번째 사진 보기' })
  await photo.click()
  const viewer = page.getByRole('dialog', { name: '식당 사진 상세보기' })
  await expect(viewer).toBeVisible()
  await expect(
    viewer.getByRole('button', { name: '사진 상세보기 닫기' }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(viewer).toHaveCount(0)
  await expect(detail).toBeVisible()
  await expect(photo).toBeFocused()
  const menuRequest = page.waitForRequest((request) =>
    request.url().includes('/photos?filter=MENU'),
  )
  await panel.getByRole('button', { name: /메뉴사진/ }).click()
  expect(new URL((await menuRequest).url()).searchParams.has('cursor')).toBe(
    false,
  )
  await expect(panel.getByText('등록된 사진이 없어요.')).toBeVisible()
  await panel.getByRole('button', { name: /^전체/ }).click()
  await expect(
    panel.getByRole('button', { name: /번째 사진 보기/ }),
  ).toHaveCount(3)
  await expect(
    panel.getByRole('button', { name: '1번째 사진 보기' }),
  ).toBeInViewport()
})

test('a touch gesture on the handle collapses the list', async ({ page }) => {
  const handle = page.getByRole('slider', { name: '식당 목록 높이 조절' })
  await handle.click({ trial: true })
  const box = await handle.boundingBox()
  if (!box) throw new Error('Missing handle')
  const client = await page.context().newCDPSession(page)
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: true })
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y }],
  })
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x, y: 740 }],
  })
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  })
  await expect(handle).toHaveAttribute('aria-valuenow', '30')
  await client.detach()
})

for (const viewport of [
  { width: 320, height: 640 },
  { width: 393, height: 500 },
  { width: 768, height: 1024 },
]) {
  test(`fits ${viewport.width}×${viewport.height} without horizontal page overflow`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true)
    await expect(
      page.getByRole('slider', { name: '식당 목록 높이 조절' }),
    ).toBeInViewport()
    await page.getByRole('button', { name: '카페', exact: true }).click()
    await expect(
      page.getByRole('button', { name: '도쿄 카페 미리보기 상세 보기' }),
    ).toBeInViewport()
  })
}

test('leaving expanded detail restores a keyboard entry into the summary', async ({
  page,
}) => {
  await page
    .getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' })
    .click()
  await page.getByRole('slider', { name: '식당 상세 높이 조절' }).press('End')
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('region', { name: '선택한 식당 요약', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('slider', { name: '식당 상세 높이 조절' }),
  ).toBeFocused()
})

test('external login restores map filters and expanded detail after a fresh document without replaying save', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: '음식점', exact: true }).click()
  await page
    .getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' })
    .click()
  await page.getByRole('slider', { name: '식당 상세 높이 조절' }).press('End')
  await page.getByRole('tab', { name: '메뉴', exact: true }).click()
  await page.getByRole('button', { name: '저장하기', exact: true }).click()
  await expect(page).toHaveURL(/\/login-required$/)
  await page.route('https://kauth.kakao.com/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<p>외부 로그인 페이지</p>',
    }),
  )
  await page.getByRole('button', { name: '카카오로 로그인하기' }).click()
  await expect(page).toHaveURL(/kauth\.kakao\.com/)
  await page.route('**/api/v1/auth/**', async (route) => {
    const reissue = new URL(route.request().url()).pathname.endsWith('/reissue')
    await route.fulfill({
      headers: reissue
        ? {
            Authorization: 'Bearer browser-test-session',
            'Access-Control-Expose-Headers': 'Authorization',
          }
        : {},
      json: {
        success: true,
        code: 'SUCCESS',
        message: 'ok',
        data: reissue ? null : { role: 'USER', subjectId: 1 },
      },
    })
  })
  const writes: string[] = []
  page.on('request', (request) => {
    if (request.method() !== 'GET' && request.url().includes('/collections'))
      writes.push(request.url())
  })
  // New navigation creates a new JS realm: no in-memory map/auth/query state survives.
  await page.goto('/map')
  await expect(
    page.getByRole('dialog', { name: '코코네 돈카츠 신도심점 전체 상세' }),
  ).toBeVisible()
  await expect(
    page.getByRole('tab', { name: '메뉴', exact: true }),
  ).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('dialog')).toHaveCount(1)
  expect(writes).toEqual([])
  await page.getByRole('button', { name: '식당 상세 닫기' }).click()
  await expect(
    page.getByRole('button', { name: '음식점', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem('hashi:map:oauth-resume:v1'),
    ),
  ).toBeNull()
})

test('bookmark FAB matches the nonmodal collection panel and keeps create and navigation fixed', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 393, height: 971 })
  await page.route('**/api/v1/auth/**', async (route) => {
    const reissue = new URL(route.request().url()).pathname.endsWith('/reissue')
    await route.fulfill({
      headers: reissue
        ? {
            Authorization: 'Bearer browser-test-session',
            'Access-Control-Expose-Headers': 'Authorization',
          }
        : {},
      json: {
        success: true,
        code: 'SUCCESS',
        message: 'ok',
        data: reissue ? null : { role: 'USER', subjectId: 1 },
      },
    })
  })
  await page.route('**/api/v1/collections*', (route) =>
    route.fulfill({
      json: {
        success: true,
        code: 'SUCCESS',
        message: 'ok',
        data: {
          collections: ['여름', '겨울', '가을', '봄', '다음'].map(
            (season, index) => ({
              collectionId: index + 1,
              name: `2026 도쿄 ${season} 여행`,
              color: ['red', 'yellow', 'green', 'purple', 'blue'][index],
              cover: { imageUrls: photoPaths },
              savedCount: 10,
              visibility: 'private',
            }),
          ),
          totalCount: 5,
          hasNext: false,
        },
      },
    }),
  )
  await page.route('**/api/v1/collections/1**', (route) => {
    const path = new URL(route.request().url()).pathname
    const data = path.endsWith('/map-markers')
      ? { collectionId: 1, content: restaurantFixtures.slice(0, 2) }
      : path.endsWith('/restaurants')
        ? {
            content: restaurantFixtures.slice(0, 2),
            totalCount: 80,
            hasNext: false,
          }
        : {
            collectionId: 1,
            name: '2026 도쿄 여름 여행',
            description:
              '여행 가기 전에 저장해둔 맛집들 중에서 꼭 가보고 싶은 곳',
            color: 'red',
            visibility: 'private',
            owner: true,
            savedCount: 80,
          }
    return route.fulfill({
      json: { success: true, code: 'SUCCESS', message: 'ok', data },
    })
  })
  await page.goto('http://localhost:5173/map')
  const bookmark = page.getByRole('button', { name: '저장 목록 보기' })
  await bookmark.click()
  const panel = page.getByRole('region', { name: '지도 저장 컬렉션' })
  await expect(panel).toBeVisible()
  await panel.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  )
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(panel.getByText('컬렉션 5개')).toBeVisible()
  await expect(
    page.getByRole('button', { name: '지도', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
  const coverPhotos = panel
    .getByRole('button', { name: '2026 도쿄 여름 여행 컬렉션 열기' })
    .locator('img[data-slot="thumbnail-image"]')
  await expect(coverPhotos).toHaveCount(3)
  for (const photo of await coverPhotos.all()) {
    await expect
      .poll(() =>
        photo.evaluate((element) => {
          const image = element.getBoundingClientRect()
          const cell = element.parentElement!.getBoundingClientRect()
          return [image.width, image.height, cell.width, cell.height]
        }),
      )
      .toEqual([24, 24, 24, 24])
  }
  const create = panel.getByRole('button', { name: '새 컬렉션 만들기' })
  const createBox = await create.boundingBox()
  const list = panel.getByRole('region', { name: '컬렉션 목록' })
  await list.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  await expect(
    panel.getByRole('button', { name: '2026 도쿄 다음 여행 컬렉션 열기' }),
  ).toBeVisible()
  expect((await create.boundingBox())?.y).toBe(createBox?.y)
  await list.evaluate((element) => {
    element.scrollTop = 0
  })
  const image = await page.screenshot({
    path: testInfo.outputPath('bookmark-collections.png'),
  })
  await testInfo.attach('bookmark-collections', {
    body: image,
    contentType: 'image/png',
  })
  await panel
    .getByRole('button', { name: '2026 도쿄 여름 여행 컬렉션 열기' })
    .click()
  await expect(page).toHaveURL(/\/map$/)
  const detail = page.getByRole('region', { name: '저장 컬렉션 패널' })
  await expect(
    detail.getByRole('heading', { name: '2026 도쿄 여름 여행' }),
  ).toBeVisible()
  await expect(
    detail.getByText('여행 가기 전에 저장해둔 맛집들 중에서 꼭 가보고 싶은 곳'),
  ).toBeVisible()
  await expect(page.getByText('저장한 장소')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: '지도', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
  await page.setViewportSize({ width: 393, height: 852 })
  await detail.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  )
  await detail.getByRole('button', { name: '정렬 선택' }).click()
  await page.screenshot({
    path: testInfo.outputPath('collection-detail-sort.png'),
  })
  await page.getByRole('menuitemradio', { name: '별점순' }).click()
  await detail.getByRole('button', { name: '분류 선택' }).click()
  await page.screenshot({
    path: testInfo.outputPath('collection-detail-category.png'),
  })
  await page.getByRole('menuitemradio', { name: '카페' }).click()
  await expect(page).toHaveURL(/\/map\?sort=rating&category=cafe$/)
  await page.getByRole('button', { name: '컬렉션 지도 닫기' }).click()
  await expect(panel).toBeVisible()
  await panel.getByRole('slider', { name: '컬렉션 목록 높이 조절' }).focus()
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
})
