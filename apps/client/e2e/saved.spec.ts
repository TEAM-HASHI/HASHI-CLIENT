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
