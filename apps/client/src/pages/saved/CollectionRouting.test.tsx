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
} from 'react-router-dom'
import { useState } from 'react'

import { BottomNavigationLayout } from '@/app/layout/BottomNavigationLayout'
import { SavedPage } from '@/pages/saved/SavedPage'
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
