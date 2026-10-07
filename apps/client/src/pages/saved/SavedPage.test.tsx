import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import { BottomNavigationLayout } from '@/app/layout/BottomNavigationLayout'
import { SavedPage } from '@/pages/saved/SavedPage'
import { CollectionDataProvider } from '@/pages/saved/data/CollectionDataProvider'
import { collectionMocks } from '@/pages/saved/data/collectionMocks'
import type { CollectionData } from '@/pages/saved/types'
import { isCollectionMapState } from '@/pages/saved/utils/collectionMapState'

const setup = (data: CollectionData = collectionMocks) => {
  const router = createMemoryRouter(
    [
      {
        element: <BottomNavigationLayout />,
        children: [
          { path: '/saved', element: <SavedPage /> },
          { path: '/map', element: <div data-testid="map-owner" /> },
        ],
      },
    ],
    { initialEntries: ['/saved'] },
  )
  render(
    <CollectionDataProvider initialData={data}>
      <RouterProvider router={router} />
    </CollectionDataProvider>,
  )
  return { router, user: userEvent.setup() }
}

afterEach(cleanup)

describe('SavedPage', () => {
  it('shows computed counts and fixed latest label without a collection sort menu', () => {
    setup()
    expect(screen.getByText('총 4개')).toBeInTheDocument()
    expect(screen.getByText('최신순')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '정렬 선택' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '새 컬렉션 만들기' }),
    ).toBeEnabled()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /공유/ }),
    ).not.toBeInTheDocument()
  })

  it('applies sorting and category immediately, retains sorting, and closes each menu', async () => {
    const { user } = setup()
    await user.click(
      screen.getByRole('button', { name: '2026 도쿄 봄 여행 컬렉션 열기' }),
    )
    const list = screen.getByRole('list', { name: '저장 식당' })
    expect(screen.getByText('저장한 장소')).toBeVisible()
    expect(list.querySelector('li')).toHaveAttribute(
      'data-restaurant-id',
      'sushi',
    )
    await user.click(screen.getByRole('button', { name: '정렬 선택' }))
    await user.click(screen.getByRole('menuitemradio', { name: '별점순' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(list.querySelector('li')).toHaveAttribute(
      'data-restaurant-id',
      'cafe',
    )
    expect(screen.getByRole('button', { name: '정렬 선택' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: '분류 선택' }))
    await user.click(screen.getByRole('menuitemradio', { name: '음식점' }))
    expect(screen.getByText('총 2곳')).toBeInTheDocument()
    expect(screen.getByText('별점순')).toBeInTheDocument()
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: '분류 선택' }))
    await user.click(screen.getByRole('menuitemradio', { name: '전체' }))
    expect(within(list).getAllByRole('listitem')).toHaveLength(4)
  })

  it('dismisses menus with Escape, outside click and keyboard selection', async () => {
    const { user } = setup()
    await user.click(
      screen.getByRole('button', { name: '2026 도쿄 봄 여행 컬렉션 열기' }),
    )
    await user.click(screen.getByRole('button', { name: '정렬 선택' }))
    await user.keyboard('{End}{Enter}')
    expect(screen.getByText('리뷰순')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '정렬 선택' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '분류 선택' }))
    await user.click(screen.getByRole('heading'))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('keeps an empty collection and an empty list visible without invented actions', async () => {
    const { user } = setup()
    await user.click(
      screen.getByRole('button', { name: '2026 도쿄 가을 여행 컬렉션 열기' }),
    )
    expect(screen.getByText('총 0곳')).toBeInTheDocument()
    expect(
      within(screen.getByRole('list', { name: '저장 식당' })).queryAllByRole(
        'listitem',
      ),
    ).toHaveLength(0)
    await user.click(
      screen.getByRole('button', { name: '컬렉션 목록으로 돌아가기' }),
    )
    expect(screen.getByText('총 4개')).toBeInTheDocument()
    cleanup()
    setup({ ...collectionMocks, collections: [] })
    expect(screen.getByText('총 0개')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '새 컬렉션 만들기' }),
    ).toBeInTheDocument()
  })

  it('hands collection state to the existing map and keeps the saved tab active', async () => {
    const { user, router } = setup()
    await user.click(
      screen.getByRole('button', { name: '2026 도쿄 봄 여행 컬렉션 열기' }),
    )
    await user.click(screen.getByRole('button', { name: '정렬 선택' }))
    await user.click(screen.getByRole('menuitemradio', { name: '리뷰순' }))
    await user.click(screen.getByRole('button', { name: '지도로 보기' }))
    expect(router.state.location.pathname).toBe('/map')
    expect(router.state.location.state).toEqual({
      collectionId: 'spring',
      sort: 'reviews',
      category: 'all',
    })
    expect(screen.getByRole('button', { name: '저장' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await router.navigate(-1)
    expect(await screen.findByText('리뷰순')).toBeInTheDocument()
    expect(screen.getByText('총 4곳')).toBeInTheDocument()
  })

  it('rejects invalid map handoffs', () => {
    for (const state of [
      null,
      {},
      { collectionId: '' },
      { collectionId: 'spring', sort: 'unknown', category: 'all' },
    ])
      expect(isCollectionMapState(state)).toBe(false)
  })
})
