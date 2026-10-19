import { expect, test } from '@playwright/test'

const openFixture = async (
  page: import('@playwright/test').Page,
  query = '',
) => {
  await page.goto(`/e2e/fixtures/saved.html${query}`)
  await page.getByRole('navigation').waitFor()
}

for (const viewport of [
  { width: 393, height: 852 },
  { width: 320, height: 400 },
  { width: 820, height: 1180 },
]) {
  test(`독립 컬렉션 목록·상세는 내부 스크롤과 진입 초기화를 유지한다 ${viewport.width}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await openFixture(page, '?scenario=long')
    const listScroll = page.getByRole('region', { name: '컬렉션 목록' })
    const lastCollection = listScroll.getByRole('listitem').last()
    await lastCollection.scrollIntoViewIfNeeded()
    expect(await listScroll.evaluate((node) => node.scrollTop)).toBeGreaterThan(
      0,
    )
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    await expect(
      page.getByRole('heading', { name: '저장 컬렉션' }),
    ).toBeInViewport()
    await expect(
      page.getByRole('button', { name: '새 컬렉션 만들기' }),
    ).toBeInViewport()
    await lastCollection.getByRole('button', { name: /더보기$/ }).click()
    await expect(
      page.getByRole('menuitem', { name: '수정하기' }),
    ).toBeInViewport()
    await page.keyboard.press('Escape')
    await page.screenshot({ path: testInfo.outputPath('internal-list.png') })
    await lastCollection.getByRole('button', { name: /컬렉션 열기$/ }).click()
    const restaurantScroll = page.getByRole('region', {
      name: '저장 식당 목록',
    })
    expect(await restaurantScroll.evaluate((node) => node.scrollTop)).toBe(0)
    const lastRestaurant = restaurantScroll.getByRole('listitem').last()
    await lastRestaurant.scrollIntoViewIfNeeded()
    expect(
      await restaurantScroll.evaluate((node) => node.scrollTop),
    ).toBeGreaterThan(0)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    await expect(
      page.getByRole('button', { name: '분류 선택' }),
    ).toBeInViewport()
    const rowBox = await lastRestaurant.boundingBox()
    const navBox = await page.getByRole('navigation').boundingBox()
    expect(rowBox!.y + rowBox!.height).toBeLessThanOrEqual(navBox!.y + 1)
    await page.getByRole('button', { name: '분류 선택' }).click()
    await expect(
      page.getByRole('menuitemradio', { name: '음식점' }),
    ).toBeInViewport()
    await page.keyboard.press('Escape')
    await restaurantScroll.hover()
    await page.mouse.wheel(0, 1000)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    await page.screenshot({ path: testInfo.outputPath('internal-detail.png') })
    await page.getByRole('button', { name: '컬렉션 목록으로 돌아가기' }).click()
    expect(await listScroll.evaluate((node) => node.scrollTop)).toBe(0)
  })
}

test('일반 컬렉션 패널은 마지막 항목에서도 헤더와 필터·생성에 접근할 수 있다', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 393, height: 852 })
  for (const mode of ['list', 'detail']) {
    await openFixture(page, `?panel=${mode}&scenario=long`)
    const list = page.getByRole('list', {
      name: mode === 'list' ? '저장 컬렉션' : '저장 식당',
    })
    await list.getByRole('listitem').last().scrollIntoViewIfNeeded()
    await expect(
      page.getByRole('heading', {
        name: mode === 'list' ? '컬렉션 20개' : '가'.repeat(20),
      }),
    ).toBeInViewport()
    if (mode === 'list') {
      await expect(
        page.getByRole('button', { name: '새 컬렉션 만들기' }),
      ).toBeInViewport()
    } else {
      await expect(
        page.getByRole('button', { name: '분류 선택' }),
      ).toBeInViewport()
      await page.getByRole('button', { name: '분류 선택' }).click()
      await expect(
        page.getByRole('menuitemradio', { name: '음식점' }),
      ).toBeVisible()
    }
    await page.screenshot({
      path: testInfo.outputPath(`fixed-panel-${mode}.png`),
    })
  }
})

test('생성·수정 폼은 하단 입력 중에도 헤더 뒤로가기에 접근할 수 있다', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 400 })
  for (const path of [
    '/saved/collections/new',
    '/saved/collections/spring/edit',
  ]) {
    await page.goto(
      `/e2e/fixtures/saved.html?formHeader=${path.endsWith('/new') ? 'new' : 'edit'}#${path}`,
    )
    await page.getByRole('button', { name: '비공개', exact: true }).click()
    await expect(
      page.getByRole('button', { name: '뒤로가기', exact: true }),
    ).toBeInViewport()
    await expect(
      page.getByText(
        path.endsWith('/new') ? '새 컬렉션 만들기' : '컬렉션 수정',
        { exact: true },
      ),
    ).toBeInViewport()
    await page.screenshot({
      path: testInfo.outputPath(
        path.endsWith('/new') ? 'fixed-create.png' : 'fixed-edit.png',
      ),
    })
  }
})

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
    page.getByRole('button', { name: '저장', exact: true }),
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

test('낮은 패널에서 30자 설명 이후에도 필터와 마지막 식당에 접근할 수 있다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 400 })
  await openFixture(page, '?panel=detail&scenario=multiline')
  await expect(page.locator('[data-restaurant-id]')).toHaveCount(40)
  await expect(
    page.getByText('가'.repeat(14) + ' ' + '나'.repeat(15), { exact: true }),
  ).toBeVisible()
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
      '새 여행',
    )
    await expect(page.getByLabel('설명', { exact: true })).toHaveValue(
      '여행 설명',
    )
    await page.getByLabel('컬렉션명', { exact: true }).fill('  새 여행  ')
    await page.getByLabel('설명', { exact: true }).fill('  여행 설명  ')
    await expect(page.getByRole('button', { name: '저장하기' })).toBeDisabled()
    await page.getByLabel('컬렉션명', { exact: true }).fill('  수정 이름  ')
    await page.getByRole('button', { name: '뒤로가기', exact: true }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('discard.png') })
    await page.getByRole('button', { name: '계속하기' }).click()
    await expect(page.getByLabel('컬렉션명', { exact: true })).toHaveValue(
      '  수정 이름  ',
    )
    await page.getByRole('button', { name: '저장하기' }).click()
    await page.getByRole('button', { name: /수정 이름.*컬렉션 열기/ }).click()
    await expect(page.getByRole('heading', { name: /수정 이름/ })).toBeVisible()
    await page.getByRole('button', { name: '지도로 보기' }).click()
    await expect(page.getByRole('heading', { name: /수정 이름/ })).toBeVisible()
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

test('독립 상세 URL·정렬·분류·지도 종료·새로고침·없는 ID', async ({ page }) => {
  await openFixture(page)
  await page.getByRole('button', { name: /봄 여행.*컬렉션 열기/ }).click()
  await expect(page).toHaveURL(/#\/saved\/collections\/spring$/)
  await page.getByRole('button', { name: '정렬 선택' }).click()
  await page.getByRole('menuitemradio', { name: '리뷰순' }).click()
  await page.getByRole('button', { name: '분류 선택' }).click()
  await page.getByRole('menuitemradio', { name: '카페', exact: true }).click()
  await page.getByRole('button', { name: '지도로 보기' }).click()
  await page.getByRole('button', { name: '컬렉션 지도 보기 종료' }).click()
  await expect(page).toHaveURL(
    /#\/saved\/collections\/spring\?sort=reviews&category=cafe$/,
  )
  await expect(page.getByText('총 1곳')).toBeVisible()
  await page.reload()
  await expect(page.getByText('총 1곳')).toBeVisible()
  await expect(page.getByText('리뷰순')).toBeVisible()
  await page.goto(
    '/e2e/fixtures/saved.html?direct=1#/saved/collections/missing/edit',
  )
  await expect(page).toHaveURL(/#\/saved$/)
  await expect(page.getByText('총 4개')).toBeVisible()
})

test('브라우저 뒤로가기 폐기·계속하기와 직접 생성 URL의 기본 복귀', async ({
  page,
}) => {
  await openFixture(page)
  await page.getByRole('button', { name: /봄 여행.*더보기/ }).click()
  await page.getByRole('menuitem', { name: '수정하기' }).click()
  await expect(page).toHaveURL(/#\/saved\/collections\/spring\/edit$/)
  await page.getByLabel('컬렉션명', { exact: true }).fill('폐기할 원문 ')
  await page.goBack()
  const dialog = page.getByRole('alertdialog')
  await dialog.getByRole('button', { name: '계속하기' }).click()
  await expect(page.getByLabel('컬렉션명', { exact: true })).toHaveValue(
    '폐기할 원문 ',
  )
  await page.goBack()
  await dialog.getByRole('button', { name: '뒤로가기' }).click()
  await expect(page).toHaveURL(/#\/saved$/)
  await page.goto('/e2e/fixtures/saved.html?direct=1#/saved/collections/new')
  await page.getByRole('button', { name: '뒤로가기', exact: true }).click()
  await expect(page).toHaveURL(/#\/saved$/)
})

test('저장 모달에서 생성 취소·브라우저 복귀 후에도 원래 식당과 명시적 선택을 유지한다', async ({
  page,
}) => {
  await openFixture(page, '?save=sushi')
  await page
    .getByRole('dialog')
    .getByRole('button', { name: '새 컬렉션 만들기' })
    .click()
  await expect(page).toHaveURL(/#\/saved\/collections\/new$/)
  await page.goBack()
  const dialog = page.getByRole('dialog', { name: '컬렉션 저장' })
  await expect(
    dialog.getByRole('radio', { name: /봄 여행.*저장됨/ }),
  ).toBeDisabled()
  await expect(
    dialog.getByRole('button', { name: '저장', exact: true }),
  ).toBeDisabled()
})

test('목록과 상세를 브라우저 뒤로가기·앞으로가기로 이동한다', async ({
  page,
}) => {
  await openFixture(page)
  await page.getByRole('button', { name: /봄 여행.*컬렉션 열기/ }).click()
  await page.goBack()
  await expect(page.getByRole('heading', { name: '저장 컬렉션' })).toBeVisible()
  await page.goForward()
  await expect(
    page.getByRole('heading', { name: '2026 도쿄 봄 여행' }),
  ).toBeVisible()
})

test('로컬 상태 저장 모달의 식당·기존 선택은 생성 취소와 브라우저 뒤로가기에도 복원된다', async ({
  page,
}) => {
  await openFixture(page, '?localSave=sushi')
  await page.getByRole('button', { name: '식당 저장 열기' }).click()
  await page.getByRole('radio', { name: /가을/ }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: '새 컬렉션 만들기' })
    .click()
  await page.goBack()
  let dialog = page.getByRole('dialog', { name: '컬렉션 저장' })
  await expect(
    dialog.getByRole('radio', { name: /봄 여행.*저장됨/ }),
  ).toBeDisabled()
  await expect(dialog.getByRole('radio', { name: /가을/ })).toBeChecked()
  await dialog.getByRole('button', { name: '새 컬렉션 만들기' }).click()
  await page.getByLabel('컬렉션명', { exact: true }).fill('새 명시적 대상')
  await page.getByRole('radio', { name: '주황' }).check()
  await page.getByRole('button', { name: '만들기', exact: true }).click()
  dialog = page.getByRole('dialog', { name: '컬렉션 저장' })
  await expect(dialog.getByRole('radio', { name: /가을/ })).toBeChecked()
  await expect(
    dialog.getByRole('radio', { name: '새 명시적 대상', exact: true }),
  ).not.toBeChecked()
  await dialog.getByRole('button', { name: '취소' }).click()
  await page.reload()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
