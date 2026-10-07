import { expect, test } from '@playwright/test'

const openFixture = async (
  page: import('@playwright/test').Page,
  query = '',
) => {
  await page.goto(`/e2e/fixtures/saved.html${query}`)
  await page.getByRole('navigation').waitFor()
}

test('회귀: 일반 목록을 스크롤한 뒤 상세는 상단에서 열린다', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 382, height: 647 })
  await openFixture(page, '?scenario=long')
  await page
    .getByRole('button', { name: /컬렉션 열기$/ })
    .last()
    .click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  await expect(
    page.getByRole('heading', { name: '가'.repeat(20) }),
  ).toBeInViewport()
  await page.screenshot({ path: testInfo.outputPath('detail-entry.png') })
})

test('회귀: 지도 목록 높이와 상세 진입 스크롤', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 382, height: 647 })
  await openFixture(page, '?panel=list')
  await page
    .getByRole('button', { name: '2026 도쿄 여름 여행 컬렉션 열기' })
    .click()
  const panel = page.getByRole('region', { name: '저장 컬렉션 패널' })
  await expect
    .poll(() =>
      panel.locator('.overflow-y-auto').evaluate((node) => node.scrollTop),
    )
    .toBe(0)
  await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '393')
  await page.screenshot({ path: testInfo.outputPath('panel-detail-entry.png') })
  await openFixture(page, '?panel=list&scenario=empty')
  await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '234')
  await openFixture(page, '?panel=list')
  await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '374')
  await page.screenshot({ path: testInfo.outputPath('panel-list-entry.png') })
  await openFixture(page, '?panel=list&scenario=long')
  await page
    .getByRole('button', { name: /컬렉션 열기$/ })
    .last()
    .click()
  const scroller = panel.locator('.overflow-y-auto')
  await expect.poll(() => scroller.evaluate((node) => node.scrollTop)).toBe(0)
  await scroller.evaluate((node) => {
    node.scrollTop = 100
  })
  await page.getByRole('slider').press('Home')
  await page.getByRole('slider').press('ArrowUp')
  await expect.poll(() => scroller.evaluate((node) => node.scrollTop)).toBe(100)
})

for (const viewport of [
  { width: 393, height: 852 },
  { width: 320, height: 568 },
  { width: 820, height: 1180 },
]) {
  test(`PR3 선택·부분 이동·삭제 ${viewport.width}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await openFixture(page)
    await page
      .getByRole('button', { name: '2026 도쿄 봄 여행 컬렉션 열기' })
      .click()
    await page
      .getByRole('button', { name: '컬렉션 더보기', exact: true })
      .click()
    await page.getByRole('menuitem', { name: '편집하기' }).click()
    const editor = page.getByRole('dialog', {
      name: '컬렉션 편집',
      exact: true,
    })
    await expect(
      editor.getByRole('button', { name: '이동', exact: true }),
    ).toBeDisabled()
    await editor.getByText('전체 선택', { exact: true }).click()
    await expect(editor.getByText('4개 선택됨')).toBeVisible()
    await expect(
      editor
        .getByRole('checkbox', { name: '전체 선택' })
        .locator('..')
        .locator('span')
        .first(),
    ).toHaveCSS('background-color', 'rgb(39, 48, 51)')
    await page.screenshot({
      path: testInfo.outputPath('editor-all.png'),
      animations: 'disabled',
    })
    await editor.getByRole('button', { name: '이동 4' }).click()
    const target = page.getByRole('dialog', {
      name: '컬렉션 이동',
      exact: true,
    })
    await expect(
      target.getByRole('radio', { name: '2026 도쿄 봄 여행' }),
    ).toHaveCount(0)
    await target.getByRole('radio', { name: '2026 도쿄 여름 여행' }).click()
    await expect(
      target.getByText('이미 저장된 2곳은 이동하지 않아요.'),
    ).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('move-partial.png'),
      animations: 'disabled',
    })
    await target.getByRole('button', { name: '이동', exact: true }).click()
    await expect(editor.getByText('2개 선택됨')).toBeVisible()
    await expect(editor.locator('[data-restaurant-id]')).toHaveCount(2)
    await editor.getByRole('button', { name: '삭제 2' }).click()
    await page.getByRole('button', { name: '취소하기' }).click()
    await expect(editor.getByText('2개 선택됨')).toBeVisible()
    await editor.getByRole('button', { name: '삭제 2' }).click()
    await page.getByRole('button', { name: '삭제하기', exact: true }).click()
    await expect(editor.locator('[data-restaurant-id]')).toHaveCount(0)
    await expect(
      editor.getByRole('button', { name: '삭제', exact: true }),
    ).toBeDisabled()
    await editor.getByRole('button', { name: '편집 종료' }).click()
    await expect(page.getByText('총 0곳')).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  })
}

test('PR3 긴 편집 목록·개별 선택·취소 유지', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 400 })
  await openFixture(page, '?scenario=long')
  await page
    .getByRole('button', { name: `${'가'.repeat(20)} 컬렉션 열기` })
    .first()
    .click()
  await page.getByRole('button', { name: '컬렉션 더보기', exact: true }).click()
  await page.getByRole('menuitem', { name: '편집하기' }).click()
  const editor = page.getByRole('dialog', { name: '컬렉션 편집', exact: true })
  await editor.locator('[data-restaurant-id="long-0"] label').click()
  await expect(
    editor.getByRole('checkbox', { name: '전체 선택' }),
  ).toHaveJSProperty('indeterminate', true)
  await expect(
    editor
      .getByRole('checkbox', { name: '전체 선택' })
      .locator('..')
      .locator('span')
      .first(),
  ).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await page.screenshot({ path: testInfo.outputPath('editor-partial.png') })
  const button = editor.getByRole('button', { name: '이동 1' })
  const before = await button.boundingBox()
  await editor.locator('[data-restaurant-id]').last().scrollIntoViewIfNeeded()
  await expect(editor.locator('[data-restaurant-id]').last()).toBeInViewport()
  expect((await button.boundingBox())!.y).toBe(before!.y)
  await button.click()
  const target = page.getByRole('dialog', { name: '컬렉션 이동', exact: true })
  await target.getByRole('radio').last().scrollIntoViewIfNeeded()
  await expect(
    target.getByRole('button', { name: '새 컬렉션 만들기' }),
  ).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('long-move.png'),
    animations: 'disabled',
  })
  await target.getByRole('button', { name: '취소', exact: true }).click()
  await expect(editor.getByText('1개 선택됨')).toBeVisible()
  await editor.getByRole('button', { name: '편집 종료' }).click()
  await page.getByRole('button', { name: '컬렉션 더보기', exact: true }).click()
  await page.getByRole('menuitem', { name: '편집하기' }).click()
  await expect(editor.getByRole('checkbox', { checked: true })).toHaveCount(0)
})

test('PR3 단일 중복 이동·생성 복귀·취소', async ({ page }) => {
  await openFixture(page)
  await page
    .getByRole('button', { name: '2026 도쿄 봄 여행 컬렉션 열기' })
    .click()
  await page
    .getByRole('button', { name: '히마와리 스시 신도심점 더보기', exact: true })
    .click()
  await page.getByRole('menuitem', { name: '이동하기' }).click()
  const target = page.getByRole('dialog', { name: '컬렉션 이동', exact: true })
  await target.getByRole('radio', { name: '2026 도쿄 여름 여행' }).click()
  await target.getByRole('button', { name: '이동', exact: true }).click()
  await expect(target.getByText('이미 저장된 식당이에요.')).toBeVisible()
  await target.getByRole('button', { name: '새 컬렉션 만들기' }).click()
  await page.getByLabel('컬렉션명', { exact: true }).fill('이동 목적지')
  await page.getByRole('radio', { name: '빨강' }).check()
  await page.getByRole('button', { name: '만들기', exact: true }).click()
  await expect(
    target.getByRole('radio', { name: '이동 목적지' }),
  ).not.toBeChecked()
  await target.getByRole('radio', { name: '이동 목적지' }).click()
  await target.getByRole('button', { name: '이동', exact: true }).click()
  await expect(page.getByText('총 3곳')).toBeVisible()
})

test('PR3 비공개 공유·목록 삭제·지도 관리 연결', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 393, height: 852 })
  await openFixture(page, '?panel=list')
  await page.getByRole('button', { name: '2026 도쿄 가을 여행 더보기' }).click()
  await page.getByRole('menuitem', { name: '링크 복사' }).click()
  await expect(page.getByRole('alertdialog')).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('private-share.png'),
    animations: 'disabled',
  })
  await page.getByRole('button', { name: '공개 후 공유' }).click()
  await expect(
    page.getByText(
      '공개 컬렉션으로 변경했어요. 링크 복사는 아직 연결되지 않았어요.',
    ),
  ).toBeVisible()
  await expect(page.getByText('컬렉션 링크가 복사되었어요.')).toHaveCount(0)
  await page.getByRole('button', { name: '2026 도쿄 가을 여행 더보기' }).click()
  await page.getByRole('menuitem', { name: '링크 복사' }).click()
  await expect(page.getByRole('button', { name: '공개 후 공유' })).toHaveCount(
    0,
  )
  const shareToast = page.getByText('링크 복사는 아직 연결되지 않았어요.', {
    exact: true,
  })
  await expect(shareToast).toBeVisible()
  await expect(shareToast.locator('..').locator('svg')).toHaveCount(1)
  await page.screenshot({ path: testInfo.outputPath('share-link-icon.png') })
  await page.getByRole('button', { name: '2026 도쿄 가을 여행 더보기' }).click()
  await page.getByRole('menuitem', { name: '삭제하기' }).click()
  await page.screenshot({
    path: testInfo.outputPath('delete-collection.png'),
    animations: 'disabled',
  })
  await page.getByRole('button', { name: '취소하기' }).click()
  await page.getByRole('button', { name: '2026 도쿄 가을 여행 더보기' }).click()
  await page.getByRole('menuitem', { name: '삭제하기' }).click()
  await page.getByRole('button', { name: '삭제하기', exact: true }).click()
  await expect(page.getByText('컬렉션이 삭제되었어요.')).toBeVisible()
  await expect(page.getByRole('heading', { name: '컬렉션 3개' })).toBeVisible()
  await page
    .getByRole('button', { name: '2026 도쿄 봄 여행 컬렉션 열기' })
    .click()
  await page.getByRole('button', { name: '컬렉션 더보기', exact: true }).click()
  await page.getByRole('menuitem', { name: '편집하기' }).click()
  await expect(
    page.getByRole('dialog', { name: '컬렉션 편집', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: '편집 종료' }).click()
  await expect(
    page.getByRole('heading', { name: '2026 도쿄 봄 여행' }),
  ).toBeVisible()
})

for (const viewport of [
  { width: 393, height: 852 },
  { width: 320, height: 568 },
  { width: 1440, height: 900 },
]) {
  test(`목록과 상세 ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await openFixture(page)
    await expect(page.getByText('총 4개')).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath('list.png'),
      fullPage: true,
    })
    await page
      .getByRole('button', { name: '2026 도쿄 봄 여행 컬렉션 열기' })
      .click()
    await expect(page.getByText('총 4곳')).toBeVisible()
    await page.getByRole('button', { name: '정렬 선택' }).click()
    await page.getByRole('menuitemradio', { name: '별점순' }).click()
    await expect(page.locator('[data-restaurant-id]').first()).toHaveAttribute(
      'data-restaurant-id',
      'cafe',
    )
    await page.getByRole('button', { name: '분류 선택' }).click()
    await page.screenshot({ path: testInfo.outputPath('detail-category.png') })
    await page.getByRole('menuitemradio', { name: '카페' }).click()
    await expect(page.getByText('총 1곳')).toBeVisible()
    await expect(page.getByText('별점순')).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    const cta = await page
      .getByRole('button', { name: '지도로 보기' })
      .boundingBox()
    const nav = await page.getByRole('navigation').boundingBox()
    expect(cta!.y + cta!.height).toBeLessThanOrEqual(nav!.y)
    expect(errors).toEqual([])
  })
}

test('빈 목록과 긴 이름·목록의 스크롤', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await openFixture(page, '?scenario=empty')
  await expect(page.getByText('총 0개')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('empty.png') })
  await openFixture(page, '?scenario=long')
  await expect(page.getByText('총 20개')).toBeVisible()
  await page
    .getByRole('list', { name: '저장 컬렉션' })
    .getByRole('button')
    .first()
    .click()
  await expect(page.getByText('총 40곳')).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('long-detail.png') })
  await page.locator('[data-restaurant-id]').last().scrollIntoViewIfNeeded()
  await expect(page.locator('[data-restaurant-id]').last()).toBeInViewport()
})

test('패널 드래그·접힘 유지·정렬·분류·종료', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 393, height: 852 })
  await openFixture(page, '?panel=detail')
  const handle = page.getByRole('slider')
  await expect(handle).toHaveAttribute('aria-valuenow', '393')
  await page.getByRole('button', { name: '정렬 선택' }).click()
  await page.getByRole('menuitemradio', { name: '리뷰순' }).click()
  await page.screenshot({ path: testInfo.outputPath('panel.png') })
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
  await expect(handle).toHaveAttribute('aria-valuenow', '756')
  await page.getByRole('button', { name: '컬렉션 지도 보기 종료' }).click()
  await expect(handle).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: '지도', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
})

test('지도 목록은 작은 커버를 사용하고 저장 탭을 유지한다', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 393, height: 852 })
  await openFixture(page, '?panel=list')
  await page.getByRole('slider').press('End')
  await expect(page.getByRole('heading', { name: '컬렉션 4개' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: '저장', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
  const list = page.getByRole('list', { name: '저장 컬렉션' })
  const row = list.getByRole('listitem').first()
  const cover = row.locator('button > div').first()
  await expect(cover).toHaveCSS('width', '50px')
  await expect(cover).toHaveCSS('height', '50px')
  await expect(row).toHaveCSS('padding-top', '18px')
  await expect(list).not.toContainText('공개')
  await expect(
    page.getByRole('region', { name: '저장 컬렉션 패널' }),
  ).toHaveCSS('height', '756px')
  await page.getByRole('slider').blur()
  const thumbnail = await cover
    .locator('[data-slot="image-fallback"]')
    .first()
    .boundingBox()
  expect(thumbnail?.width).toBe(24)
  expect(thumbnail?.height).toBe(24)
  await page.screenshot({ path: testInfo.outputPath('compact-list.png') })
  await row.getByRole('button', { name: /컬렉션 열기$/ }).click()
  await expect(page.getByRole('list', { name: '저장 식당' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: '저장', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
})

test('낮은 패널의 드롭다운과 긴 콘텐츠', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 400 })
  await openFixture(page, '?panel=detail&scenario=long')
  await page.getByRole('button', { name: '분류 선택' }).click()
  const menu = page.getByRole('menu')
  const rect = await menu.boundingBox()
  expect(rect!.x).toBeGreaterThanOrEqual(0)
  expect(rect!.y).toBeGreaterThanOrEqual(0)
  expect(rect!.x + rect!.width).toBeLessThanOrEqual(320)
  expect(rect!.y + rect!.height).toBeLessThanOrEqual(400)
  await page.screenshot({ path: testInfo.outputPath('short-panel-menu.png') })
  await page.getByRole('menuitemradio', { name: '전체' }).click()
  await page.locator('[data-restaurant-id]').last().scrollIntoViewIfNeeded()
  await expect(page.locator('[data-restaurant-id]').last()).toBeInViewport()
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
      page
        .getByRole('dialog', { name: '새 컬렉션 만들기' })
        .getByRole('banner'),
    ).toBeInViewport()
    await expect
      .poll(() =>
        page
          .getByRole('dialog')
          .locator('.overflow-y-auto')
          .evaluate((node) => node.scrollTop),
      )
      .toBe(0)
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
