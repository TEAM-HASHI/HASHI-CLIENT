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
  await row.getByRole('button', { name: /컬렉션 열기$/ }).click()
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

for (const viewport of [
  { width: 393, height: 852 },
  { width: 320, height: 568 },
  { width: 820, height: 1180 },
]) {
  test(`PR2 생성·수정·폐기 ${viewport.width}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    await openFixture(page)
    await page.getByRole('button', { name: '새 컬렉션 만들기' }).click()
    await expect(
      page.getByRole('button', { name: '만들기', exact: true }),
    ).toBeDisabled()
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
    await page.getByLabel('컬렉션명', { exact: true }).fill('  새 여행  ')
    await page.getByLabel('설명', { exact: true }).fill('  여행 설명  ')
    await page.getByRole('radio', { name: '파랑' }).check()
    await page.getByRole('button', { name: '비공개', exact: true }).click()
    await page.screenshot({ path: testInfo.outputPath('create.png') })
    const submit = await page
      .getByRole('button', { name: '만들기', exact: true })
      .boundingBox()
    expect(submit!.y + submit!.height).toBeLessThanOrEqual(viewport.height)
    await page.getByRole('button', { name: '만들기', exact: true }).click()
    await expect(page.getByText('총 5개')).toBeVisible()
    await page.getByRole('button', { name: /새 여행.*더보기/ }).click()
    await page.getByRole('menuitem', { name: '수정하기' }).click()
    await expect(page.getByLabel('컬렉션명', { exact: true })).toHaveValue(
      '  새 여행  ',
    )
    await page.getByLabel('컬렉션명', { exact: true }).fill('  수정 이름  ')
    await page.getByRole('button', { name: '뒤로가기', exact: true }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('discard.png') })
    await page.getByRole('button', { name: '계속하기' }).click()
    await expect(page.getByLabel('컬렉션명', { exact: true })).toHaveValue(
      '  수정 이름  ',
    )
    await page.getByRole('button', { name: '저장하기' }).click()
    await page.getByRole('button', { name: '수정 이름 컬렉션 열기' }).click()
    await expect(page.getByRole('heading', { name: '수정 이름' })).toBeVisible()
    await page.getByRole('button', { name: '지도로 보기' }).click()
    await expect(page.getByRole('heading', { name: '수정 이름' })).toBeVisible()
    await expect(page.getByText('여행 설명', { exact: true })).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  })
}

test('PR2 저장 대상 선택·생성 복귀·중복 저장 방지', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 393, height: 852 })
  await openFixture(page, '?save=sushi')
  const dialog = page.getByRole('dialog', { name: '컬렉션 저장' })
  await expect(
    dialog.getByRole('button', { name: '저장', exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByRole('radio', { name: /봄 여행.*저장됨/ }),
  ).toBeDisabled()
  await page.screenshot({ path: testInfo.outputPath('save-targets.png') })
  await dialog.getByRole('button', { name: '새 컬렉션 만들기' }).click()
  await page.getByLabel('컬렉션명', { exact: true }).fill('저장 대상')
  await page.getByRole('radio', { name: '주황' }).check()
  await page.getByRole('button', { name: '만들기', exact: true }).click()
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
  await expect(
    dialog.getByRole('button', { name: '저장', exact: true }),
  ).toBeDisabled()
  await page.getByRole('radio', { name: '저장 대상', exact: true }).click()
  await dialog.getByRole('button', { name: '저장', exact: true }).click()
  await page.getByRole('button', { name: '저장 대상 컬렉션 열기' }).click()
  await expect(page.getByText('총 1곳')).toBeVisible()
  await expect(page.locator('[data-restaurant-id="sushi"]')).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('radio', { name: '저장 대상', exact: true }),
  ).toHaveCount(0)
})

test('지도 패널에서 생성·수정한 컬렉션 데이터로 상세를 연다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 })
  await openFixture(page, '?panel=list')
  await page.getByRole('button', { name: '새 컬렉션 만들기' }).click()
  await page.getByLabel('컬렉션명', { exact: true }).fill('지도에서 생성')
  await page.getByRole('radio', { name: '주황' }).check()
  await page.getByRole('button', { name: '만들기', exact: true }).click()
  await page.getByRole('button', { name: '지도에서 생성 더보기' }).click()
  await page.getByRole('menuitem', { name: '수정하기' }).click()
  await page.getByLabel('컬렉션명', { exact: true }).fill('지도에서 수정')
  await page.getByRole('button', { name: '저장하기' }).click()
  await page.getByRole('button', { name: '지도에서 수정 컬렉션 열기' }).click()
  await expect(
    page.getByRole('heading', { name: '지도에서 수정' }),
  ).toBeVisible()
  await page.getByRole('slider').press('End')
  await expect(
    page.getByRole('button', { name: '패널로 돌아가기' }),
  ).toBeVisible()
  await page.getByRole('button', { name: '지도로 보기' }).click()
  await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '393')
})

test('PR2 작은 저장 모달에서 목록만 스크롤', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 400 })
  await openFixture(page, '?save=sushi&scenario=long')
  const dialog = page.getByRole('dialog', { name: '컬렉션 저장' })
  const footer = dialog.getByRole('button', { name: '저장', exact: true })
  const before = await footer.boundingBox()
  await page.getByRole('radio').last().scrollIntoViewIfNeeded()
  await expect(
    dialog.getByRole('button', { name: '새 컬렉션 만들기' }),
  ).toBeVisible()
  const after = await footer.boundingBox()
  expect(after!.y).toBe(before!.y)
  expect(after!.y + after!.height).toBeLessThanOrEqual(400)
  await page.screenshot({ path: testInfo.outputPath('short-save.png') })
})
