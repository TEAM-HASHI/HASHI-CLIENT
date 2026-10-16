import { expect, test } from '@playwright/test'

const openFixture = async (
  page: import('@playwright/test').Page,
  query = '',
) => {
  await page.goto(`/e2e/fixtures/saved.html${query}`)
  await page.getByRole('navigation').waitFor()
}

test('패널 드래그·접힘 유지·정렬·분류·종료', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 })
  await openFixture(page, '?panel=detail')
  const handle = page.getByRole('slider')
  await expect(handle).toHaveAttribute('aria-valuenow', '393')
  await page.getByRole('button', { name: '정렬 선택' }).click()
  await page.getByRole('menuitemradio', { name: '리뷰순' }).click()
  const box = await handle.boundingBox()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    box!.x + box!.width / 2,
    box!.y + box!.height / 2 + 150,
    { steps: 10 },
  )
  await page.mouse.up()
  await expect(handle).toHaveAttribute('aria-valuenow', '30')
  await handle.press('ArrowUp')
  await expect(page.getByText('리뷰순')).toBeVisible()
  await handle.press('End')
  await expect(handle).toBeHidden()
  await expect(
    page.getByRole('region', { name: '저장 컬렉션 패널' }),
  ).toHaveCSS('height', '768px')
  const list = page.getByRole('list', { name: '저장 식당' })
  await expect(
    page.getByRole('button', { name: '패널로 돌아가기' }),
  ).toBeVisible()
  await expect(list).toBeVisible()
  await page.getByRole('button', { name: '지도로 보기' }).click()
  await expect(handle).toHaveAttribute('aria-valuenow', '393')
  await expect(page.getByText('리뷰순')).toBeVisible()
  await page.getByRole('button', { name: '컬렉션 지도 보기 종료' }).click()
  await expect(handle).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: '지도', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
})

test('컬렉션 목록은 최대 높이를 유지하며 내부 스크롤 후 상세를 열 수 있다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 })
  await openFixture(page, '?panel=list&scenario=long')
  const list = page.getByRole('list', { name: '저장 컬렉션' })
  const row = list.getByRole('listitem').last()
  const handle = page.getByRole('slider')
  await handle.press('End')
  await expect(handle).toBeVisible()
  await expect(handle).toHaveAttribute('aria-valuenow', '393')
  await expect(page.getByRole('button', { name: '지도로 보기' })).toHaveCount(0)
  await row.scrollIntoViewIfNeeded()
  await expect(row).toBeInViewport()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  await row.getByRole('button').click()
  await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '393')
  await expect(page.getByRole('list', { name: '저장 식당' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: '저장', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
})

test('낮은 패널에서 여러 줄 설명 이후에도 필터와 마지막 식당에 접근할 수 있다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 400 })
  await openFixture(page, '?panel=detail&scenario=multiline')
  await page.getByRole('button', { name: '분류 선택' }).click()
  const menu = page.getByRole('menu')
  const rect = await menu.boundingBox()
  expect(rect!.x).toBeGreaterThanOrEqual(0)
  expect(rect!.y).toBeGreaterThanOrEqual(0)
  expect(rect!.x + rect!.width).toBeLessThanOrEqual(320)
  expect(rect!.y + rect!.height).toBeLessThanOrEqual(400)
  await page.getByRole('menuitemradio', { name: '전체' }).click()
  await page.locator('[data-restaurant-id]').last().scrollIntoViewIfNeeded()
  await expect(page.locator('[data-restaurant-id]').last()).toBeInViewport()
})

test('확장과 축소 후에도 보던 식당과 목록 내 위치를 유지한다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 })
  await openFixture(page, '?panel=detail&scenario=long')
  const list = page.getByRole('list', { name: '저장 식당' })
  const readPosition = () =>
    list.evaluate((ul) => {
      const scroller = ul.parentElement!
      const top = scroller.getBoundingClientRect().top
      const row = [...ul.children].find(
        (row) => row.getBoundingClientRect().bottom > top,
      )!
      return {
        id: row.getAttribute('data-restaurant-id'),
        offset: row.getBoundingClientRect().top - top,
      }
    })
  await list.evaluate((ul) => {
    ul.parentElement!.scrollTop = 400
  })
  await page.evaluate(() => new Promise(requestAnimationFrame))
  const before = await readPosition()
  await page.getByRole('slider').focus()
  await page.keyboard.press('End')
  await expect(
    page.getByRole('region', { name: '저장 컬렉션 패널' }),
  ).toHaveCSS('height', '768px')
  const expanded = await readPosition()
  expect(expanded.id).toBe(before.id)
  expect(Math.abs(expanded.offset - before.offset)).toBeLessThan(1)
  await page.getByRole('button', { name: '지도로 보기' }).click()
  await expect(
    page.getByRole('region', { name: '저장 컬렉션 패널' }),
  ).toHaveCSS('height', '393px')
  const returned = await readPosition()
  expect(returned.id).toBe(before.id)
  expect(Math.abs(returned.offset - before.offset)).toBeLessThan(1)
})
