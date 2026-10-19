import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { useState } from 'react'

import { BottomNavigationLayout } from '@/app/layout/BottomNavigationLayout'
import { SavedPage } from '@/pages/saved/SavedPage'
import { CollectionEditorPage } from '@/pages/saved/CollectionEditorPage'
import { CollectionFormPage } from '@/pages/saved/CollectionFormPage'
import { CollectionSaveDialog } from '@/pages/saved/components/CollectionSaveDialog'
import { CollectionDataProvider } from '@/pages/saved/data/CollectionDataProvider'
import { collectionMocks } from '@/pages/saved/data/collectionMocks'
import {
  getCollectionReturn,
  getCollectionSaveRestaurantId,
} from '@/pages/saved/utils/collectionNavigation'
import type { CollectionData } from '@/pages/saved/types'

const SavedHost = () => {
  const location = useLocation()
  const [restaurantId, setRestaurantId] = useState(() =>
    getCollectionSaveRestaurantId(location.state),
  )
  return (
    <>
      <SavedPage />
      <button onClick={() => setRestaurantId('sushi')}>식당 저장 열기</button>
      {restaurantId && (
        <CollectionSaveDialog
          restaurantId={restaurantId}
          onClose={() => setRestaurantId(null)}
        />
      )}
    </>
  )
}
const MapHost = () => {
  const navigate = useNavigate()
  return <button onClick={() => navigate(-1)}>컬렉션 지도 보기 종료</button>
}
const RestaurantDetailFixture = () => {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  return (
    <>
      <h1>식당 상세 {restaurantId}</h1>
      <button onClick={() => navigate(-1)}>상세 뒤로가기</button>
    </>
  )
}
const setup = (
  path = '/saved',
  data: CollectionData = collectionMocks,
  previous?: string,
  saving = false,
) => {
  const router = createMemoryRouter(
    [
      {
        element: <BottomNavigationLayout />,
        children: [
          { path: '/saved', element: <SavedHost /> },
          { path: '/saved/collections/:collectionId', element: <SavedHost /> },
          { path: '/map', element: <MapHost /> },
        ],
      },
      {
        path: '/saved/collections/:collectionId/restaurants/edit',
        element: <CollectionEditorPage />,
      },
      {
        path: '/restaurants/:restaurantId',
        element: <RestaurantDetailFixture />,
      },
      { path: '/saved/collections/new', element: <CollectionFormPage /> },
      {
        path: '/saved/collections/:collectionId/edit',
        element: <CollectionFormPage />,
      },
    ],
    {
      initialEntries: [
        ...(previous ? [previous] : []),
        {
          pathname: path.split('?')[0],
          search: path.includes('?') ? `?${path.split('?')[1]}` : '',
          state: saving ? { collectionSaveRestaurantId: 'sushi' } : null,
        },
      ],
    },
  )
  render(
    <CollectionDataProvider initialData={data}>
      <RouterProvider router={router} />
    </CollectionDataProvider>,
  )
  return { router, user: userEvent.setup() }
}
afterEach(cleanup)

describe('컬렉션 독립 라우트와 복귀', () => {
  it.each(['header', 'browser'])(
    '식당 상세 %s 복귀는 원래 컬렉션·정렬·분류·스크롤과 방문 이력을 유지한다',
    async (source) => {
      const path = '/saved/collections/spring?sort=rating&category=cafe'
      const { router, user } = setup(path, collectionMocks, '/saved')
      const originalKey = router.state.location.key
      const scroller = screen.getByRole('region', { name: '저장 식당 목록' })
      scroller.scrollTop = 240
      await user.click(
        screen.getByRole('button', { name: /^히마와리 카페 4\.9/ }),
      )
      expect(router.state.location.pathname).toBe('/restaurants/cafe')
      if (source === 'header')
        await user.click(screen.getByRole('button', { name: '상세 뒤로가기' }))
      else
        await act(async () => {
          await router.navigate(-1)
        })
      expect(router.state.location.key).toBe(originalKey)
      expect(
        router.state.location.pathname + router.state.location.search,
      ).toBe(path)
      expect(screen.getByText('별점순')).toBeVisible()
      expect(screen.getByText('카페')).toBeVisible()
      expect(
        screen.getByRole('region', { name: '저장 식당 목록' }).scrollTop,
      ).toBe(240)
      await act(async () => {
        await router.navigate(-1)
      })
      expect(router.state.location.pathname).toBe('/saved')
      await act(async () => {
        await router.navigate(path)
      })
      expect(
        screen.getByRole('region', { name: '저장 식당 목록' }).scrollTop,
      ).toBe(0)
    },
  )

  it.each(['완료', '취소'])(
    '생성 %s 후 원래 목록 이력으로 복귀한다',
    async (action) => {
      const { router, user } = setup('/saved', collectionMocks, '/map')
      const originalKey = router.state.location.key
      await user.click(screen.getByRole('button', { name: '새 컬렉션 만들기' }))
      if (action === '완료') {
        await user.type(screen.getByLabelText('컬렉션명'), '이력 확인')
        await user.click(screen.getByRole('radio', { name: '빨강' }))
        await user.click(screen.getByRole('button', { name: '만들기' }))
      } else await user.click(screen.getByRole('button', { name: '뒤로가기' }))
      expect(router.state.location.pathname).toBe('/saved')
      expect(router.state.location.key).toBe(originalKey)
      await act(async () => {
        await router.navigate(-1)
      })
      expect(router.state.location.pathname).toBe('/map')
    },
  )

  it('상세에서 편집을 종료하면 원래 이력으로 복귀하고 뒤로가기는 목록으로 간다', async () => {
    const { user, router } = setup()
    await user.click(
      screen.getByRole('button', { name: '2026 도쿄 봄 여행 컬렉션 열기' }),
    )
    await user.click(screen.getByRole('button', { name: '정렬 선택' }))
    await user.click(screen.getByRole('menuitemradio', { name: '별점순' }))
    const detailKey = router.state.location.key
    await user.click(screen.getByRole('button', { name: '컬렉션 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '편집하기' }))
    await user.click(screen.getByRole('button', { name: '편집 종료' }))
    expect(router.state.location.pathname).toBe('/saved/collections/spring')
    expect(router.state.location.key).toBe(detailKey)
    expect(screen.getByText('별점순')).toBeVisible()
    await act(async () => {
      await router.navigate(-1)
    })
    expect(router.state.location.pathname).toBe('/saved')
  })

  it('편집 직접 진입은 이전 화면에 관계없이 상세로 종료한다', async () => {
    const { user, router } = setup(
      '/saved/collections/spring/restaurants/edit?sort=rating&category=all',
      collectionMocks,
      '/map',
    )
    await user.click(screen.getByRole('button', { name: '편집 종료' }))
    expect(router.state.location.pathname).toBe('/saved/collections/spring')
    expect(screen.getByText('별점순')).toBeVisible()
  })

  it('식당 편집 중 생성 후 선택 식당·이동 대상과 편집 URL을 복원한다', async () => {
    const { user, router } = setup(
      '/saved/collections/spring?sort=rating&category=all',
    )
    await user.click(screen.getByRole('button', { name: '컬렉션 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '편집하기' }))
    await user.click(
      screen.getByRole('checkbox', { name: '히마와리 스시 신도심점 선택' }),
    )
    await user.click(screen.getByRole('button', { name: '이동 1' }))
    await user.click(screen.getByRole('radio', { name: '2026 도쿄 여름 여행' }))
    await user.click(
      within(screen.getByRole('dialog', { name: '컬렉션 이동' })).getByRole(
        'button',
        { name: '새 컬렉션 만들기' },
      ),
    )
    expect(router.state.location.pathname).toBe('/saved/collections/new')
    await user.type(screen.getByLabelText('컬렉션명'), '관리 중 새 대상')
    await user.click(screen.getByRole('radio', { name: '파랑' }))
    await user.click(screen.getByRole('button', { name: '만들기' }))
    expect(router.state.location.pathname).toBe(
      '/saved/collections/spring/restaurants/edit',
    )
    const target = screen.getByRole('dialog', { name: '컬렉션 이동' })
    expect(within(target).getAllByRole('radio')[0]).toHaveAccessibleName(
      '관리 중 새 대상',
    )
    expect(
      within(target).getByRole('radio', { name: '관리 중 새 대상' }),
    ).not.toBeChecked()
    expect(
      within(target).getByRole('radio', { name: '2026 도쿄 여름 여행' }),
    ).toBeChecked()
    await user.click(within(target).getByRole('button', { name: '취소' }))
    expect(
      screen.getByRole('checkbox', { name: '히마와리 스시 신도심점 선택' }),
    ).toBeChecked()
    expect(screen.getByRole('button', { name: '이동 1' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: '편집 종료' }))
    await act(async () => {
      await router.navigate(-1)
    })
    expect(router.state.location.pathname).toBe('/saved/collections/spring')
    expect(
      screen.queryByRole('region', { name: '컬렉션 편집' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('이동 대상 생성 취소 후 뒤로가기는 편집을 종료하고 상세로 돌아간다', async () => {
    const { user, router } = setup('/saved/collections/spring')
    await user.click(screen.getByRole('button', { name: '컬렉션 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '편집하기' }))
    await user.click(
      screen.getByRole('checkbox', { name: '히마와리 스시 신도심점 선택' }),
    )
    await user.click(screen.getByRole('button', { name: '이동 1' }))
    await user.click(screen.getByRole('button', { name: '새 컬렉션 만들기' }))
    await user.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(router.state.location.pathname).toBe(
      '/saved/collections/spring/restaurants/edit',
    )
    await act(async () => {
      await router.navigate(-1)
    })
    expect(router.state.location.pathname).toBe('/saved/collections/spring')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it.each(['header', 'browser'])(
    '식당 편집은 독립 URL을 사용하고 %s 종료 후 선택을 초기화한다',
    async (source) => {
      const { user, router } = setup(
        '/saved/collections/spring?sort=rating&category=all',
      )
      await user.click(screen.getByRole('button', { name: '컬렉션 더보기' }))
      await user.click(screen.getByRole('menuitem', { name: '편집하기' }))
      expect(router.state.location.pathname).toBe(
        '/saved/collections/spring/restaurants/edit',
      )
      expect(
        screen.queryByRole('dialog', { name: '컬렉션 편집' }),
      ).not.toBeInTheDocument()
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
      await user.click(
        screen.getByRole('checkbox', { name: '히마와리 스시 신도심점 선택' }),
      )
      expect(screen.getByRole('button', { name: '이동 1' })).toBeEnabled()
      if (source === 'header')
        await user.click(screen.getByRole('button', { name: '편집 종료' }))
      else
        await act(async () => {
          await router.navigate(-1)
        })
      expect(router.state.location.pathname).toBe('/saved/collections/spring')
      expect(screen.getByText('별점순')).toBeVisible()
      await user.click(screen.getByRole('button', { name: '컬렉션 더보기' }))
      await user.click(screen.getByRole('menuitem', { name: '편집하기' }))
      expect(
        screen.getByRole('checkbox', { name: '히마와리 스시 신도심점 선택' }),
      ).not.toBeChecked()
      expect(screen.getByRole('button', { name: '이동' })).toBeDisabled()
    },
  )

  it('생성 후 정규화한 이름과 설명을 저장하고 새 컬렉션을 최상단에 표시한다', async () => {
    const { router, user } = setup()
    await user.click(screen.getByRole('button', { name: '새 컬렉션 만들기' }))
    expect(router.state.location.pathname).toBe('/saved/collections/new')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('컬렉션명'), ' 새 여행 ')
    await user.type(screen.getByLabelText('설명'), ' 설명 ')
    await user.click(screen.getByRole('radio', { name: '주황' }))
    await user.click(screen.getByRole('button', { name: '만들기' }))
    expect(router.state.location.pathname).toBe('/saved')
    expect(
      within(screen.getByRole('list', { name: '저장 컬렉션' })).getAllByRole(
        'listitem',
      )[0],
    ).toHaveTextContent('새 여행')
    await user.click(screen.getByRole('button', { name: /새 여행.*더보기/ }))
    await user.click(screen.getByRole('menuitem', { name: '수정하기' }))
    expect(router.state.location.pathname).toMatch(
      /\/saved\/collections\/mock-.*\/edit/,
    )
    expect(screen.getByLabelText('컬렉션명')).toHaveValue('새 여행')
    expect(screen.getByLabelText('설명')).toHaveValue('설명')
    expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled()
  })

  it('저장 모달에서 생성 후 원래 식당으로 돌아와 직접 선택한 대상에만 저장한다', async () => {
    const { user, router } = setup('/saved', collectionMocks, undefined, true)
    await user.click(screen.getByRole('radio', { name: /가을/ }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '새 컬렉션 만들기',
      }),
    )
    await user.type(screen.getByLabelText('컬렉션명'), '저장 대상')
    await user.click(screen.getByRole('radio', { name: '파랑' }))
    await user.click(screen.getByRole('button', { name: '만들기' }))
    expect(router.state.location.pathname).toBe('/saved')
    const dialog = screen.getByRole('dialog', { name: '컬렉션 저장' })
    expect(within(dialog).getByRole('radio', { name: /가을/ })).toBeChecked()
    expect(
      within(dialog).getByRole('radio', { name: '저장 대상' }),
    ).not.toBeChecked()
    expect(within(dialog).getAllByRole('radio')[0]).toHaveAccessibleName(
      '저장 대상',
    )
    expect(
      within(dialog).getByRole('radio', { name: /봄 여행.*저장됨/ }),
    ).toBeDisabled()
    await user.click(within(dialog).getByRole('radio', { name: '저장 대상' }))
    await user.click(within(dialog).getByRole('button', { name: '저장' }))
    await user.click(
      screen.getByRole('button', { name: '저장 대상 컬렉션 열기' }),
    )
    expect(screen.getByText('총 1곳')).toBeVisible()
    expect(
      screen
        .getByRole('list', { name: '저장 식당' })
        .querySelector('[data-restaurant-id="sushi"]'),
    ).toBeInTheDocument()
  })

  it('로컬 상태로 연 저장 모달은 생성 페이지에서 브라우저 뒤로가기로 돌아와도 식당과 선택을 복원한다', async () => {
    const { user, router } = setup()
    expect(router.state.location.state).toBeNull()
    await user.click(screen.getByRole('button', { name: '식당 저장 열기' }))
    await user.click(screen.getByRole('radio', { name: /가을/ }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '새 컬렉션 만들기',
      }),
    )
    await act(async () => {
      await router.navigate(-1)
    })
    const dialog = screen.getByRole('dialog', { name: '컬렉션 저장' })
    expect(
      within(dialog).getByRole('radio', { name: /봄 여행.*저장됨/ }),
    ).toBeDisabled()
    expect(within(dialog).getByRole('radio', { name: /가을/ })).toBeChecked()
    await user.click(within(dialog).getByRole('button', { name: '취소' }))
    expect(
      getCollectionSaveRestaurantId(router.state.location.state),
    ).toBeNull()
  })

  it('색상 수정 후 정규화한 이름과 설명으로 다시 열고 저장을 비활성화한다', async () => {
    const collection = {
      ...collectionMocks.collections[0],
      name: ' 여행 ',
      description: ' 설명 ',
    }
    const { user, router } = setup('/saved/collections/spring/edit', {
      ...collectionMocks,
      collections: [collection],
    })
    expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled()
    await user.click(screen.getByRole('radio', { name: '파랑' }))
    await user.click(screen.getByRole('button', { name: '저장하기' }))
    expect(router.state.location.pathname).toBe('/saved')
    await user.click(screen.getByRole('button', { name: /여행.*더보기/ }))
    await user.click(screen.getByRole('menuitem', { name: '수정하기' }))
    expect(screen.getByLabelText('컬렉션명')).toHaveValue('여행')
    expect(screen.getByLabelText('설명')).toHaveValue('설명')
    expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled()
  })

  it.each(['header', 'browser'])(
    '수정 중 %s 뒤로가기에서 계속하기는 입력을 보존하고 폐기는 목록으로 간다',
    async (source) => {
      const { router, user } = setup(
        '/saved/collections/spring/edit',
        collectionMocks,
        '/saved/collections/spring',
      )
      fireEvent.change(screen.getByLabelText('컬렉션명'), {
        target: { value: '폐기할 원문 ' },
      })
      const back = async () => {
        if (source === 'header')
          await user.click(screen.getByRole('button', { name: '뒤로가기' }))
        else
          await act(async () => {
            await router.navigate(-1)
          })
      }
      await back()
      await user.click(
        within(screen.getByRole('alertdialog')).getByRole('button', {
          name: '계속하기',
        }),
      )
      expect(screen.getByLabelText('컬렉션명')).toHaveValue('폐기할 원문 ')
      expect(router.state.location.pathname).toBe(
        '/saved/collections/spring/edit',
      )
      await back()
      await user.click(
        within(screen.getByRole('alertdialog')).getByRole('button', {
          name: '뒤로가기',
        }),
      )
      expect(router.state.location.pathname).toBe('/saved')
      expect(screen.queryByText('폐기할 원문')).not.toBeInTheDocument()
    },
  )

  it('직접 생성 URL 진입의 헤더 뒤로가기는 컬렉션 목록으로 이동한다', async () => {
    const { router, user } = setup('/saved/collections/new')
    await user.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(router.state.location.pathname).toBe('/saved')
  })

  it.each(['/saved/collections/missing', '/saved/collections/missing/edit'])(
    '없는 ID %s는 목 데이터를 만들지 않고 목록으로 복귀한다',
    async (path) => {
      const { router } = setup(path)
      expect(
        await screen.findByRole('heading', { name: '저장 컬렉션' }),
      ).toBeVisible()
      expect(router.state.location.pathname).toBe('/saved')
      expect(screen.getByText('총 4개')).toBeVisible()
    },
  )

  it('상세 URL의 정렬·분류가 지도 진입과 종료 후 유지된다', async () => {
    const { router, user } = setup(
      '/saved/collections/spring?sort=reviews&category=cafe',
    )
    expect(screen.getByText('리뷰순')).toBeVisible()
    expect(screen.getByText('총 1곳')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '지도로 보기' }))
    expect(router.state.location.state).toEqual({
      collectionId: 'spring',
      sort: 'reviews',
      category: 'cafe',
    })
    await user.click(
      screen.getByRole('button', { name: '컬렉션 지도 보기 종료' }),
    )
    expect(router.state.location.pathname).toBe('/saved/collections/spring')
    expect(screen.getByText('리뷰순')).toBeVisible()
    expect(screen.getByText('총 1곳')).toBeVisible()
  })

  it('수정 중 일반 PUSH 이동은 차단하지 않는다', async () => {
    const { router } = setup('/saved/collections/spring/edit')
    fireEvent.change(screen.getByLabelText('컬렉션명'), {
      target: { value: '수정' },
    })
    await act(async () => {
      await router.navigate('/saved')
    })
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/saved')
  })

  it('복귀 상태가 없거나 외부 주소이면 기본 목록 경로를 사용한다', () => {
    expect(getCollectionReturn(null).pathname).toBe('/saved')
    expect(
      getCollectionReturn({
        collectionReturn: { pathname: '//example.com', search: '' },
      }).pathname,
    ).toBe('/saved')
  })
})
