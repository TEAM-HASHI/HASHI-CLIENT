import { expect, test } from '@playwright/test'

test('제품 컬렉션 라우트에서 HTTP 기반 생성·편집·삭제와 실패 복귀를 연결한다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 })
  let collection: {
    collectionId: number
    name: string
    color: string
    description: string
    visibility: string
    owner: boolean
    savedCount: number
  } | null = null
  let rejectDelete = true
  const writes: string[] = []
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const method = request.method()
    let data: unknown = null
    const headers: Record<string, string> = {}
    if (path === '/api/v1/auth/reissue')
      headers.Authorization = 'Bearer browser-test-session'
    else if (path === '/api/v1/auth/me') data = { role: 'USER', subjectId: 1 }
    else if (path === '/api/v1/collections' && method === 'GET')
      data = {
        collections: collection ? [collection] : [],
        totalCount: collection ? 1 : 0,
        hasNext: false,
      }
    else if (path === '/api/v1/collections' && method === 'POST') {
      writes.push('create')
      collection = {
        ...request.postDataJSON(),
        collectionId: 42,
        owner: true,
        savedCount: 0,
      }
      data = collection
    } else if (path === '/api/v1/collections/42' && method === 'GET')
      data = collection
    else if (path === '/api/v1/collections/42' && method === 'PATCH') {
      writes.push('update')
      collection = { ...collection!, ...request.postDataJSON() }
      data = collection
    } else if (path === '/api/v1/collections/42' && method === 'DELETE') {
      writes.push('delete')
      if (rejectDelete) {
        rejectDelete = false
        await route.fulfill({
          status: 500,
          json: {
            success: false,
            code: 'COMMON-500',
            message: 'offline',
            data: null,
            path,
            timestamp: '2026-10-20T00:00:00Z',
          },
        })
        return
      }
      collection = null
    } else {
      await route.abort()
      return
    }
    await route.fulfill({
      headers,
      json: { success: true, code: 'SUCCESS', message: 'ok', data },
    })
  })
  await page.goto('/saved')
  await page.getByRole('button', { name: '새 컬렉션 만들기' }).click()
  await page.getByLabel('컬렉션명', { exact: true }).fill('브라우저 여행')
  await page.getByRole('radio', { name: '초록' }).click()
  await page.getByRole('button', { name: '만들기', exact: true }).click()
  await expect(
    page.getByRole('button', { name: '브라우저 여행 컬렉션 열기' }),
  ).toBeVisible()
  await page.getByRole('button', { name: '브라우저 여행 더보기' }).click()
  await page.getByRole('menuitem', { name: '수정하기' }).click()
  await page.getByLabel('설명', { exact: true }).fill('설명 수정')
  await page.getByLabel('컬렉션명', { exact: true }).fill('수정한 여행')
  await page.getByRole('button', { name: '저장하기', exact: true }).click()
  await expect(
    page.getByRole('button', { name: '수정한 여행 컬렉션 열기' }),
  ).toBeVisible()
  expect(collection).toMatchObject({ description: '설명 수정' })
  await page.reload()
  await expect(
    page.getByRole('button', { name: '수정한 여행 컬렉션 열기' }),
  ).toBeVisible()
  await page.getByRole('button', { name: '수정한 여행 더보기' }).click()
  await page.getByRole('menuitem', { name: '수정하기' }).click()
  await expect(page.getByLabel('설명', { exact: true })).toHaveValue(
    '설명 수정',
  )
  await expect(page.getByRole('radio', { name: '초록' })).toBeChecked()
  await page.getByRole('button', { name: '뒤로가기' }).click()
  await page.getByRole('button', { name: '수정한 여행 더보기' }).click()
  await page.getByRole('menuitem', { name: '삭제하기' }).click()
  await page.getByRole('button', { name: '삭제하기', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('alertdialog')).toBeVisible()
  await page.getByRole('button', { name: '삭제하기', exact: true }).click()
  await expect(page.getByRole('alertdialog')).toHaveCount(0)
  await expect(page.getByText('총 0개')).toBeVisible()
  expect(writes).toEqual(['create', 'update', 'delete', 'delete'])
})

test('컬렉션 목록·상세 스켈레톤과 공유·정렬을 좁은 화면에서 확인한다', async ({
  page,
}, testInfo) => {
  let releaseCollections!: () => void
  let releaseRestaurants!: () => void
  const collectionsReady = new Promise<void>((resolve) => {
    releaseCollections = resolve
  })
  const restaurantsReady = new Promise<void>((resolve) => {
    releaseRestaurants = resolve
  })
  const collection = {
    collectionId: 42,
    name: '2026 도쿄 여름 여행',
    description: '여행 가기 전에 저장해둔 맛집들',
    color: 'green',
    visibility: 'public',
    owner: true,
    savedCount: 1,
  }
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    const headers: Record<string, string> = {}
    let data: unknown = null
    if (path === '/api/v1/auth/reissue')
      headers.Authorization = 'Bearer browser-test-session'
    else if (path === '/api/v1/auth/me') data = { role: 'USER', subjectId: 1 }
    else if (path === '/api/v1/collections') {
      await collectionsReady
      data = { collections: [collection], totalCount: 1, hasNext: false }
    } else if (path === '/api/v1/collections/42') data = collection
    else if (path === '/api/v1/collections/42/restaurants') {
      await restaurantsReady
      data = {
        content: [
          {
            restaurantId: 55,
            name: '히마와리 스시 신도심점',
            rating: 4.8,
            area: '도쿄',
            foodCategory: '초밥',
          },
        ],
        totalCount: 1,
        hasNext: false,
      }
    } else {
      await route.abort()
      return
    }
    await route.fulfill({
      headers,
      json: { success: true, code: 'SUCCESS', message: 'ok', data },
    })
  })
  await page.setViewportSize({ width: 393, height: 852 })
  await page.goto('/saved')
  await expect(
    page.getByRole('status', { name: '컬렉션 목록 로딩 중' }),
  ).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('collection-list-loading.png'),
  })
  releaseCollections()
  await page
    .getByRole('button', { name: '2026 도쿄 여름 여행 컬렉션 열기' })
    .click()
  await expect(
    page.getByRole('status', { name: '저장 식당 목록 로딩 중' }),
  ).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('collection-detail-loading.png'),
  })
  releaseRestaurants()
  await expect(page.getByRole('button', { name: '컬렉션 공유' })).toBeVisible()
  for (const width of [393, 320]) {
    await page.setViewportSize({ width, height: 852 })
    await page.getByText('최신순', { exact: true }).click()
    await expect(page.getByRole('menu', { name: '정렬' })).toBeVisible()
    await page.getByRole('menuitemradio', { name: '별점순' }).click()
    await expect(page.getByRole('button', { name: '정렬 선택' })).toBeFocused()
    await page.getByRole('button', { name: '컬렉션 더보기' }).click()
    await expect(page.getByRole('menuitem')).toHaveText([
      '편집하기',
      '삭제하기',
    ])
    await page.screenshot({
      path: testInfo.outputPath(`collection-detail-${width}.png`),
    })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: '정렬 선택' }).click()
    await page.getByRole('menuitemradio', { name: '최신순' }).click()
  }
})
