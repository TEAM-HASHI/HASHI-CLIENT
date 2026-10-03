import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Public sample publishing must not require a live backend or auth session.
  await page.route('**/api/v1/**', (route) =>
    route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }),
  )
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
  await page.getByRole('searchbox').fill('없는 식당')
  await page.getByRole('searchbox').press('Enter')
  await expect(page.getByText('검색 조건에 맞는 식당이 없어요.')).toBeVisible()
  await page.getByRole('button', { name: '검색 조건 초기화' }).click()
  await expect(
    page.getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' }),
  ).toBeVisible()
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
  await expect(handle).toHaveAttribute('aria-valuenow', '756')
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
  await expect(
    page.getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' }),
  ).toBeFocused()
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
