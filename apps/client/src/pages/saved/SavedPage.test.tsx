import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BottomNavigationLayout } from '@/app/layout/BottomNavigationLayout'
import { SavedPage } from '@/pages/saved/SavedPage'
import { CollectionDataProvider } from '@/pages/saved/data/CollectionDataProvider'
import { collectionMocks } from '@/pages/saved/data/collectionMocks'
import type { CollectionData } from '@/pages/saved/types'
import { CollectionListRow } from '@/pages/saved/components/CollectionListRow'
import { SavedRestaurantRow } from '@/pages/saved/components/SavedRestaurantRow'
import {
  mapCollectionSummary,
  mapSavedRestaurant,
} from '@/features/collection/utils/collectionReadAdapters'

const setup = (
  data: CollectionData = collectionMocks,
  onRestaurantSelect?: (id: string) => void,
) => {
  const router = createMemoryRouter(
    [
      {
        element: <BottomNavigationLayout />,
        children: [
          {
            path: '/saved',
            element: <SavedPage onRestaurantSelect={onRestaurantSelect} />,
          },
          {
            path: '/saved/collections/:collectionId',
            element: <SavedPage onRestaurantSelect={onRestaurantSelect} />,
          },
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

describe('서버 응답 목록 표시', () => {
  it('없는 공개 여부와 저장 수를 비공개·0개로 표시하지 않는다', () => {
    const collection = mapCollectionSummary({ collectionId: 1, name: '여행' })
    render(
      <ul>
        <CollectionListRow
          collection={collection}
          restaurantCount={collection.savedCount}
          onSelect={vi.fn()}
        />
      </ul>,
    )
    expect(
      screen.getByRole('button', { name: '여행 컬렉션 열기' }),
    ).toBeVisible()
    expect(screen.queryByText('비공개')).not.toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('누락된 평점을 생성하지 않고 식당 ID로 상세 선택을 전달한다', async () => {
    const select = vi.fn()
    render(
      <ul>
        <SavedRestaurantRow
          restaurant={mapSavedRestaurant({
            restaurantId: 8,
            name: '스시',
            area: '도쿄',
          })}
          onSelect={select}
        />
      </ul>,
    )
    expect(screen.queryByText('0.0')).not.toBeInTheDocument()
    expect(screen.getByText('도쿄')).toHaveTextContent(/^도쿄$/)
    await userEvent.click(screen.getByRole('button', { name: '스시 도쿄' }))
    expect(select).toHaveBeenCalledExactlyOnceWith('8')
  })
})

describe('SavedPage', () => {
  it('외부 식당 선택 콜백을 유지하고 더보기 클릭은 상세 선택으로 전달하지 않는다', async () => {
    const select = vi.fn()
    const { user, router } = setup(collectionMocks, select)
    await user.click(
      screen.getByRole('button', { name: '2026 도쿄 봄 여행 컬렉션 열기' }),
    )
    await user.click(
      screen.getByRole('button', { name: '히마와리 카페 더보기' }),
    )
    expect(select).not.toHaveBeenCalled()
    await user.keyboard('{Escape}')
    await user.click(
      screen.getByRole('button', { name: /^히마와리 카페 4\.9/ }),
    )
    expect(select).toHaveBeenCalledExactlyOnceWith('cafe')
    expect(router.state.location.pathname).toBe('/saved/collections/spring')
  })

  it('shows computed counts without a collection sort menu', () => {
    setup()
    expect(screen.getByText('총 4개')).toBeInTheDocument()
    expect(screen.queryByText('최신순')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '정렬 선택' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '새 컬렉션 만들기' }),
    ).toBeEnabled()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /컬렉션 공유/ }),
    ).not.toBeInTheDocument()
  })

  it('일반 목록과 상세는 더보기 메뉴에서 공유를 제공한다', async () => {
    const { user } = setup()
    await user.click(
      screen.getByRole('button', { name: '2026 도쿄 봄 여행 더보기' }),
    )
    expect(
      screen.getAllByRole('menuitem').map((item) => item.textContent),
    ).toEqual(['수정하기', '공유하기', '삭제하기'])
    await user.keyboard('{Escape}')
    await user.click(
      screen.getByRole('button', { name: '2026 도쿄 봄 여행 컬렉션 열기' }),
    )
    expect(
      screen.queryByRole('button', { name: '컬렉션 공유' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '컬렉션 더보기' }))
    expect(
      screen.getAllByRole('menuitem').map((item) => item.textContent),
    ).toEqual(['편집하기', '공유하기', '삭제하기'])
  })

  it('상세를 독립 URL로 열고 브라우저 뒤로가기·앞으로가기로 복원한다', async () => {
    const { user, router } = setup()
    await user.click(
      screen.getByRole('button', { name: '2026 도쿄 봄 여행 컬렉션 열기' }),
    )
    expect(router.state.location.pathname).toBe('/saved/collections/spring')
    await router.navigate(-1)
    expect(
      await screen.findByRole('heading', { name: '저장 컬렉션' }),
    ).toBeVisible()
    await router.navigate(1)
    expect(
      await screen.findByRole('heading', { name: '2026 도쿄 봄 여행' }),
    ).toBeVisible()
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
})
