import { showToast } from '@hashi/hds-ui'
import { copyUrlToClipboard } from '@/shared/utils/clipboard'
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createCollection } from '@/features/collection/api/createCollection'
import { updateCollection } from '@/features/collection/api/updateCollection'
import { deleteCollection } from '@/features/collection/api/deleteCollection'
import { getCollection } from '@/features/collection/api/getCollection'
import { getCollections } from '@/features/collection/api/getCollections'
import { getSavedRestaurants } from '@/features/collection/api/getSavedRestaurants'
import { getCollectionMapMarkers } from '@/pages/saved/api/getCollectionMapMarkers'

import { appRoutes } from '@/app/router/routes'
import { getRestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import type { PropsWithChildren } from 'react'
import {
  clearAuthSession,
  setAccessToken,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'
import { createQueryClient } from '@/shared/lib/queryClient'
import { ROUTES } from '@/app/router/path'
import { clearMapSession } from '@/pages/map/utils/mapSession'
import { HttpStatusError } from '@/shared/api/apiError'
import { getAuthMe } from '@/features/auth/api/getAuthMe'
import { requestTokenReissue } from '@/shared/api/requestTokenReissue'
import {
  createMapLocationFixture,
  createMapPageFixture,
  createMapStoreFixture,
  createMapSummaryFixture,
  mapRegionsFixture,
} from '@/pages/map/__tests__/mapApiFixtures'
import type { MapPageRequest } from '@/pages/map/api/mapApiTypes'

vi.mock('@/features/auth/api/getAuthMe', () => ({ getAuthMe: vi.fn() }))
vi.mock('@/shared/api/requestTokenReissue', () => ({
  requestTokenReissue: vi.fn(),
}))

vi.mock('@/shared/utils/clipboard', () => ({ copyUrlToClipboard: vi.fn() }))
vi.mock('@hashi/hds-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@hashi/hds-ui')>()),
  showToast: vi.fn(),
}))

vi.mock('@/app/providers/AuthSessionRestoreGate', () => ({
  AuthSessionRestoreGate: ({ children }: PropsWithChildren) => children,
}))

vi.mock('@/features/magazine/api/getMagazineBanners', () => ({
  getMagazineBanners: vi.fn(async () => ({ banners: [] })),
}))

vi.mock('@/features/restaurantList/api/getRestaurants', () => ({
  getRestaurants: vi.fn(async () => ({
    hasNext: false,
    nextCursor: undefined,
    restaurants: [],
  })),
}))

vi.mock('@/features/collection/api/getCollection', () => ({
  getCollection: vi.fn(),
}))
vi.mock('@/features/collection/api/getCollections', () => ({
  getCollections: vi.fn(),
}))
vi.mock('@/features/collection/api/getSavedRestaurants', () => ({
  getSavedRestaurants: vi.fn(),
}))
vi.mock('@/pages/saved/api/getCollectionMapMarkers', () => ({
  getCollectionMapMarkers: vi.fn(),
}))
vi.mock('@/features/collection/api/createCollection', () => ({
  createCollection: vi.fn(),
}))
vi.mock('@/features/collection/api/updateCollection', () => ({
  updateCollection: vi.fn(),
}))
vi.mock('@/features/collection/api/deleteCollection', () => ({
  deleteCollection: vi.fn(),
}))
vi.mock('@/features/collection/api/removeSavedRestaurants', () => ({
  removeSavedRestaurants: vi.fn(),
}))
vi.mock('@/features/collection/api/moveSavedRestaurants', () => ({
  moveSavedRestaurants: vi.fn(),
}))
vi.mock('@/features/collection/api/saveRestaurant', () => ({
  saveRestaurant: vi.fn(),
}))
vi.mock('@/features/collection/api/getRestaurantSaves', () => ({
  getRestaurantSaveCounts: vi.fn(async () => ({})),
  getMyRestaurantSaves: vi.fn(async () => ({})),
}))

vi.mock('@/pages/map/api/getMapRegions', () => ({
  getMapRegions: vi.fn(async () => mapRegionsFixture),
}))
vi.mock('@/pages/map/api/getMapRestaurants', () => ({
  getMapRestaurants: vi.fn(async (request: MapPageRequest) =>
    createMapPageFixture(request),
  ),
}))
vi.mock('@/pages/map/api/getMapRestaurantLocation', () => ({
  getMapRestaurantLocation: vi.fn(async (id: string) =>
    createMapLocationFixture(id),
  ),
}))
vi.mock('@/features/restaurantDetail/api/getRestaurantSummary', () => ({
  getRestaurantSummary: vi.fn(async (id: number) =>
    createMapSummaryFixture(id),
  ),
}))
vi.mock(
  '@/features/restaurantDetail/api/getRestaurantStoreInformation',
  () => ({
    getRestaurantStoreInformation: vi.fn(async (id: number) =>
      createMapStoreFixture(id),
    ),
  }),
)
vi.mock('@/features/restaurantDetail/api/getRestaurantMenus', () => ({
  getRestaurantMenus: vi.fn(async () => ({ menus: [], hasNext: false })),
}))
vi.mock('@/features/restaurantDetail/api/getRestaurantReviews', () => ({
  getRestaurantReviews: vi.fn(async () => ({
    averageRating: 4.5,
    reviewCount: 0,
    reviews: [],
    hasNext: false,
  })),
}))
vi.mock('@/features/restaurantDetail/api/getRestaurantMain', () => ({
  getRestaurantMain: vi.fn(),
}))
vi.mock('@/features/restaurantDetail/api/getRestaurantMenu', () => ({
  getRestaurantMenu: vi.fn(),
}))
vi.mock(
  '@/features/restaurantDetail/api/getRandomRestaurantRecommendation',
  () => ({ getRandomRestaurantRecommendation: vi.fn() }),
)

vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: PropsWithChildren) => children,
  Map: ({ children }: PropsWithChildren) => children,
  AdvancedMarker: ({ children }: PropsWithChildren) => children,
  useApiLoadingStatus: () => 'LOADED',
  APILoadingStatus: {
    LOADED: 'LOADED',
    FAILED: 'FAILED',
    AUTH_FAILURE: 'AUTH_FAILURE',
  },
  useMap: () => null,
}))

const renderRoute = async (initialEntry: string) => {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [initialEntry],
  })
  const queryClient = createQueryClient()

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  await act(async () => {
    await vi.dynamicImportSettled()
  })
  return { router }
}

describe('appRoutes', () => {
  it('지도 북마크는 모달 대신 생성·커버·저장 수·메뉴가 있는 컬렉션 패널을 연다', async () => {
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, 393, 887))
    try {
      setAccessToken('test-session')
      const { router } = await renderRoute('/map')
      const user = userEvent.setup()
      await user.click(
        await screen.findByRole('button', { name: '저장 목록 보기' }),
      )
      expect(
        await screen.findByRole('region', { name: '지도 저장 컬렉션' }),
      ).toBeVisible()
      expect(
        screen.queryByRole('dialog', { name: '내 컬렉션' }),
      ).not.toBeInTheDocument()
      expect(screen.queryByText('컬렉션 전체 보기')).not.toBeInTheDocument()
      expect(screen.getByText('컬렉션 1개')).toBeVisible()
      expect(
        screen.getByRole('button', { name: 'API 여행 컬렉션 열기' }),
      ).toBeVisible()
      expect(
        screen.getByRole('button', { name: 'API 여행 더보기' }),
      ).toBeVisible()
      expect(screen.getByRole('button', { name: '지도' })).toHaveAttribute(
        'aria-current',
        'page',
      )
      expect(
        screen.getByRole('button', { name: '저장 목록 보기' }),
      ).toHaveAttribute('aria-pressed', 'true')
      await user.click(screen.getByRole('button', { name: '새 컬렉션 만들기' }))
      expect(router.state.location.pathname).toBe('/saved/collections/new')
      await act(async () => {
        await vi.dynamicImportSettled()
      })
      await user.click(await screen.findByRole('button', { name: '뒤로가기' }))
      expect(router.state.location.pathname).toBe('/map')
      expect(
        await screen.findByRole('region', { name: '지도 저장 컬렉션' }),
      ).toBeVisible()
      await user.click(screen.getByRole('button', { name: '저장 목록 보기' }))
      expect(
        screen.queryByRole('region', { name: '지도 저장 컬렉션' }),
      ).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: '저장 목록 보기' }))
      act(() => startAuthenticatedSession('other-account', 2))
      expect(
        screen.queryByRole('region', { name: '지도 저장 컬렉션' }),
      ).not.toBeInTheDocument()
    } finally {
      rect.mockRestore()
    }
  })
  it('지도 목록에서 컬렉션을 선택하면 지도 탭의 패널 상세를 열고 닫으면 목록으로 돌아간다', async () => {
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, 393, 768))
    try {
      setAccessToken('test-session')
      const { router } = await renderRoute('/map')
      const user = userEvent.setup()
      await user.click(
        await screen.findByRole('button', { name: '저장 목록 보기' }),
      )
      await user.click(
        await screen.findByRole('button', { name: 'API 여행 컬렉션 열기' }),
      )
      expect(router.state.location.pathname).toBe('/map')
      expect(
        await screen.findByRole('region', { name: '저장 컬렉션 패널' }),
      ).toBeVisible()
      expect(
        await screen.findByRole('heading', { name: 'API 여행', level: 2 }),
      ).toBeVisible()
      expect(screen.getByText('설명')).toBeVisible()
      expect(screen.queryByText('저장한 장소')).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: '전체 지역 보기' }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: '저장 목록 보기' }),
      ).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: '지도' })).toHaveAttribute(
        'aria-current',
        'page',
      )
      await user.click(screen.getByRole('button', { name: '정렬 선택' }))
      await user.click(screen.getByRole('menuitemradio', { name: '별점순' }))
      await user.click(screen.getByRole('button', { name: '분류 선택' }))
      await user.click(screen.getByRole('menuitemradio', { name: '카페' }))
      expect(
        router.state.location.pathname + router.state.location.search,
      ).toBe('/map?sort=rating&category=cafe')
      await user.click(screen.getByRole('button', { name: '컬렉션 지도 닫기' }))
      expect(router.state.location.pathname).toBe('/map')
      expect(
        await screen.findByRole('region', { name: '지도 저장 컬렉션' }),
      ).toBeVisible()
    } finally {
      rect.mockRestore()
    }
  })
  it.each(['list', 'detail'])(
    '지도 %s에서 컬렉션을 삭제해도 토스트와 지도 목록 패널을 유지한다',
    async (entry) => {
      const rect = vi
        .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
        .mockReturnValue(new DOMRect(0, 0, 393, 768))
      try {
        setAccessToken('test-session')
        vi.mocked(deleteCollection).mockImplementation(async () => {
          vi.mocked(getCollections).mockResolvedValue({
            collections: [],
            totalCount: 0,
            hasNext: false,
          })
        })
        const { router } = await renderRoute('/map')
        const user = userEvent.setup()
        await user.click(
          await screen.findByRole('button', { name: '저장 목록 보기' }),
        )
        if (entry === 'detail') {
          await user.click(
            await screen.findByRole('button', { name: 'API 여행 컬렉션 열기' }),
          )
          await user.click(
            await screen.findByRole('button', { name: '컬렉션 더보기' }),
          )
        } else {
          await user.click(
            await screen.findByRole('button', { name: 'API 여행 더보기' }),
          )
        }
        await user.click(screen.getByRole('menuitem', { name: '삭제하기' }))
        const confirm = await screen.findByRole('button', { name: '삭제하기' })
        await waitFor(() => expect(confirm).toBeEnabled())
        await user.click(confirm)
        await waitFor(() =>
          expect(showToast).toHaveBeenCalledWith(
            expect.objectContaining({ children: '컬렉션이 삭제되었어요.' }),
          ),
        )
        expect(router.state.location.pathname).toBe('/map')
        expect(
          await screen.findByRole('region', { name: '지도 저장 컬렉션' }),
        ).toBeVisible()
        expect(await screen.findByText('컬렉션 0개')).toBeVisible()
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: '지도' })).toHaveAttribute(
          'aria-current',
          'page',
        )
      } finally {
        rect.mockRestore()
      }
    },
  )
  it('컬렉션 상세에서 지도로 이동해 API 패널과 전체 핀을 표시하고 필터를 유지해 복귀한다', async () => {
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, 393, 768))
    try {
      setAccessToken('test-session')
      const description = '가'.repeat(30)
      vi.mocked(getCollection).mockResolvedValue({
        collectionId: 8,
        name: 'API 여행',
        description,
        visibility: 'private',
        owner: true,
      })
      vi.mocked(getCollectionMapMarkers).mockResolvedValue([
        {
          id: '999',
          name: '다음 페이지 식당',
          category: 'cafe',
          position: { lat: 35.6, lng: 139.7 },
          validUntil: '2030-01-01T00:00:00Z',
          attributions: [],
        },
      ])
      const { router } = await renderRoute(
        '/saved/collections/8?sort=rating&category=cafe',
      )
      const user = userEvent.setup()
      expect(await screen.findByText(description)).toBeVisible()
      await user.click(
        await screen.findByRole('button', { name: '지도로 보기' }),
      )
      await act(async () => {
        await vi.dynamicImportSettled()
      })
      expect(router.state.location.pathname).toBe('/map')
      expect(
        await screen.findByRole('heading', { name: 'API 여행' }),
      ).toBeVisible()
      expect(screen.getByText(description)).toBeVisible()
      expect(
        await screen.findByRole('button', {
          name: '다음 페이지 식당 지도 마커',
        }),
      ).toBeVisible()
      expect(screen.getByRole('button', { name: '저장' })).toHaveAttribute(
        'aria-current',
        'page',
      )
      await user.click(screen.getByRole('button', { name: '컬렉션 지도 닫기' }))
      expect(
        router.state.location.pathname + router.state.location.search,
      ).toBe('/saved/collections/8?sort=rating&category=cafe')
    } finally {
      rect.mockRestore()
    }
  })

  it('식당 상세의 컬렉션 저장 진입 상태를 기존 API 선택창에 연결한다', async () => {
    setAccessToken('test-session')
    const { router } = await renderRoute('/restaurants/55')
    await act(async () => {
      await router.navigate('/restaurants/55', {
        replace: true,
        state: { collectionSaveRestaurantId: '55' },
      })
    })
    expect(
      await screen.findByRole('dialog', { name: '컬렉션 저장' }),
    ).toBeVisible()
  })
  beforeEach(() => {
    clearAuthSession()
    vi.mocked(requestTokenReissue).mockRejectedValue(new HttpStatusError(401))
    vi.mocked(getAuthMe).mockRejectedValue(new HttpStatusError(401))
    clearMapSession()
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key')
    vi.stubEnv('VITE_GOOGLE_MAPS_MAP_ID', 'DEMO_MAP_ID')
    vi.mocked(getRestaurantSummary).mockImplementation(async (id: number) =>
      createMapSummaryFixture(id),
    )
    vi.mocked(updateCollection).mockReset()
    vi.mocked(copyUrlToClipboard).mockReset().mockResolvedValue(true)
    vi.mocked(showToast).mockClear()
    vi.mocked(getCollectionMapMarkers).mockReset().mockResolvedValue([])
    vi.mocked(getCollection).mockReset().mockResolvedValue({
      collectionId: 8,
      name: 'API 여행',
      color: 'yellow',
      description: '설명',
      visibility: 'private',
      owner: true,
      savedCount: 1,
    })
    vi.mocked(getCollections)
      .mockReset()
      .mockResolvedValue({
        collections: [
          {
            collectionId: 8,
            name: 'API 여행',
            savedCount: 1,
            visibility: 'private',
          },
        ],
        totalCount: 1,
        hasNext: false,
      })
    vi.mocked(getSavedRestaurants)
      .mockReset()
      .mockResolvedValue({
        content: [{ restaurantId: 55, name: '서버 식당', rating: 4.8 }],
        hasNext: false,
      })
  })

  afterEach(() => {
    cleanup()
    clearAuthSession()
    clearMapSession()
    vi.unstubAllEnvs()
    document.body.style.overflow = ''
  })

  it('renders the public API-backed map and bottom navigation on direct entry', async () => {
    await renderRoute(ROUTES.map)

    expect(
      await screen.findByRole('heading', { name: '도쿄 맛집 지도' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('searchbox', { name: '식당 혹은 메뉴 검색' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('removes covered navigation from accessibility when map detail fills the screen', async () => {
    const user = userEvent.setup()
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 393,
        bottom: 768,
        width: 393,
        height: 768,
        toJSON: () => ({}),
      })
    try {
      await renderRoute(ROUTES.map)
      await user.click(
        await screen.findByRole('button', {
          name: '코코네 돈카츠 신도심점 상세 보기',
        }),
      )
      screen.getByRole('slider', { name: '식당 상세 높이 조절' }).focus()
      await user.keyboard('{End}')
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
      await user.keyboard('{Escape}')
      expect(screen.getByRole('navigation')).toBeVisible()
    } finally {
      rect.mockRestore()
    }
  })

  it('컬렉션의 실제 서버 식당 ID로 상세 경로에 연결한다', async () => {
    setAccessToken('test-session')
    const { router } = await renderRoute('/saved/collections/8')
    const user = userEvent.setup()
    // 상세 페이지 구현 검증은 담당 feature 테스트에서 수행한다.
    vi.mocked(getRestaurantSummary).mockRejectedValue(new Error('offline'))
    await user.click(
      await screen.findByRole('button', { name: /서버 식당 4\.8/ }),
    )
    await act(async () => {
      await vi.dynamicImportSettled()
    })
    expect(router.state.location.pathname).toBe('/restaurants/55')
  })

  it('비로그인 공개 상세는 열고 내 목록·쓰기 화면은 인증으로 보호한다', async () => {
    clearAuthSession()
    vi.mocked(getCollection).mockResolvedValue({
      collectionId: 8,
      name: '공개 여행',
      visibility: 'public',
      owner: false,
    })
    const { router } = await renderRoute('/saved/collections/8')
    expect(
      await screen.findByRole('heading', { name: '공개 여행' }),
    ).toBeVisible()
    expect(getCollections).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('button', { name: '컬렉션 더보기' }),
    ).not.toBeInTheDocument()
    await act(async () => {
      await router.navigate('/saved/collections/8/edit')
    })
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/login-required'),
    )
    await act(async () => {
      await router.navigate('/saved')
    })
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/login-required'),
    )
  })

  it('공개 컬렉션은 상세 주소만 복사하고 공개 전환 요청 없이 성공을 안내한다', async () => {
    setAccessToken('test-session')
    vi.mocked(getCollection).mockResolvedValue({
      collectionId: 8,
      name: '공개 여행',
      visibility: 'public',
      owner: true,
    })
    const previousCalls = vi.mocked(updateCollection).mock.calls.length
    const { router } = await renderRoute(
      '/saved/collections/8?sort=rating&category=cafe',
    )
    const user = userEvent.setup()
    expect(
      screen.queryByRole('button', { name: '컬렉션 공유' }),
    ).not.toBeInTheDocument()
    await user.click(
      await screen.findByRole('button', { name: '컬렉션 더보기' }),
    )
    expect(
      screen.getAllByRole('menuitem').map((item) => item.textContent),
    ).toEqual(['편집하기', '공유하기', '삭제하기'])
    await user.click(screen.getByRole('menuitem', { name: '공유하기' }))
    await waitFor(() =>
      expect(copyUrlToClipboard).toHaveBeenCalledWith('/saved/collections/8'),
    )
    expect(updateCollection).toHaveBeenCalledTimes(previousCalls)
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ children: '컬렉션 링크가 복사되었어요.' }),
    )
    expect(router.state.location.search).toBe('?sort=rating&category=cafe')
  })

  it.each([
    ['public', 'private'],
    ['private', 'public'],
  ] as const)(
    '공유 직전 %s → %s 변경은 최신 상세로 확인한다',
    async (previous, latest) => {
      setAccessToken('test-session')
      vi.mocked(getCollection).mockResolvedValue({
        collectionId: 8,
        name: 'API 여행',
        visibility: previous,
        owner: true,
      })
      await renderRoute('/saved/collections/8')
      const user = userEvent.setup()
      await user.click(
        await screen.findByRole('button', { name: '컬렉션 더보기' }),
      )
      const callsBeforeShare = vi.mocked(getCollection).mock.calls.length
      vi.mocked(getCollection).mockResolvedValue({
        collectionId: 8,
        name: 'API 여행',
        visibility: latest,
        owner: true,
      })
      await user.click(screen.getByRole('menuitem', { name: '공유하기' }))
      if (latest === 'private') {
        expect(
          await screen.findByRole('button', { name: '공개 후 공유' }),
        ).toBeVisible()
        expect(copyUrlToClipboard).not.toHaveBeenCalled()
      } else {
        await waitFor(() =>
          expect(copyUrlToClipboard).toHaveBeenCalledWith(
            '/saved/collections/8',
          ),
        )
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      }
      expect(vi.mocked(getCollection).mock.calls.length).toBeGreaterThan(
        callsBeforeShare,
      )
      expect(updateCollection).not.toHaveBeenCalled()
    },
  )

  it('공유 직전 상세 조회 실패 시 복사·공개 전환 없이 오류를 안내하고 재시도한다', async () => {
    setAccessToken('test-session')
    await renderRoute('/saved')
    const user = userEvent.setup()
    vi.mocked(getCollection).mockRejectedValue(new HttpStatusError(404))
    await user.click(
      await screen.findByRole('button', { name: 'API 여행 더보기' }),
    )
    await user.click(screen.getByRole('menuitem', { name: '공유하기' }))
    await waitFor(() => expect(showToast).toHaveBeenCalled())
    expect(copyUrlToClipboard).not.toHaveBeenCalled()
    expect(updateCollection).not.toHaveBeenCalled()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    vi.mocked(getCollection).mockResolvedValue({
      collectionId: 8,
      visibility: 'public',
      owner: true,
    })
    await user.click(screen.getByRole('button', { name: 'API 여행 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '공유하기' }))
    await waitFor(() =>
      expect(copyUrlToClipboard).toHaveBeenCalledWith('/saved/collections/8'),
    )
  })

  it('복사 대기 중 중복 요청을 막고 화면 이탈 후에는 토스트를 띄우지 않는다', async () => {
    setAccessToken('test-session')
    vi.mocked(getCollection).mockResolvedValue({
      collectionId: 8,
      name: '공개 여행',
      visibility: 'public',
      owner: true,
    })
    let finish!: (copied: boolean) => void
    vi.mocked(copyUrlToClipboard).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    const { router } = await renderRoute('/saved/collections/8')
    const user = userEvent.setup()
    await user.click(
      await screen.findByRole('button', { name: '컬렉션 더보기' }),
    )
    await user.click(screen.getByRole('menuitem', { name: '공유하기' }))
    await user.click(screen.getByRole('button', { name: '컬렉션 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '공유하기' }))
    expect(copyUrlToClipboard).toHaveBeenCalledTimes(1)
    await act(async () => {
      await router.navigate('/saved')
    })
    await act(async () => {
      finish(true)
    })
    expect(showToast).not.toHaveBeenCalled()
  })

  it('비공개 공유는 취소·전환 실패를 보존하고 복사만 실패하면 공개를 유지한다', async () => {
    setAccessToken('test-session')
    let detail = {
      collectionId: 8,
      name: 'API 여행',
      visibility: 'private',
      owner: true,
    }
    vi.mocked(getCollection).mockImplementation(async () => detail)
    vi.mocked(getCollections).mockImplementation(async () => ({
      collections: [detail],
      totalCount: 1,
      hasNext: false,
    }))
    vi.mocked(updateCollection)
      .mockReset()
      .mockRejectedValueOnce(new Error('offline'))
      .mockImplementation(async () => {
        detail = { ...detail, visibility: 'public' }
        return detail
      })
    vi.mocked(copyUrlToClipboard).mockResolvedValue(false)
    const { router } = await renderRoute('/saved')
    const user = userEvent.setup()
    const openShare = async () => {
      await user.click(
        await screen.findByRole('button', { name: 'API 여행 더보기' }),
      )
      expect(
        screen.getAllByRole('menuitem').map((item) => item.textContent),
      ).toEqual(['수정하기', '공유하기', '삭제하기'])
      await user.click(screen.getByRole('menuitem', { name: '공유하기' }))
    }
    await openShare()
    await user.click(await screen.findByRole('button', { name: '취소하기' }))
    expect(updateCollection).not.toHaveBeenCalled()
    expect(copyUrlToClipboard).not.toHaveBeenCalled()
    await openShare()
    await user.click(
      await screen.findByRole('button', { name: '공개 후 공유' }),
    )
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(detail.visibility).toBe('private')
    expect(copyUrlToClipboard).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '공개 후 공유' }))
    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    )
    expect(detail.visibility).toBe('public')
    expect(updateCollection).toHaveBeenLastCalledWith(8, {
      visibility: 'public',
    })
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        children: '링크를 복사하지 못했습니다. 다시 시도해주세요.',
      }),
    )
    expect(router.state.location.pathname).toBe('/saved')
    await openShare()
    await waitFor(() => expect(copyUrlToClipboard).toHaveBeenCalledTimes(2))
    expect(updateCollection).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('계정 변경 시 공유창을 닫고 이전 공개 전환 응답으로 복사하지 않는다', async () => {
    startAuthenticatedSession('account-a', 1)
    let finish!: (value: Awaited<ReturnType<typeof updateCollection>>) => void
    vi.mocked(updateCollection).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    const { router } = await renderRoute('/saved')
    const user = userEvent.setup()
    await user.click(
      await screen.findByRole('button', { name: 'API 여행 더보기' }),
    )
    await user.click(screen.getByRole('menuitem', { name: '공유하기' }))
    await user.click(
      await screen.findByRole('button', { name: '공개 후 공유' }),
    )
    vi.mocked(getCollections).mockResolvedValue({
      collections: [{ collectionId: 9, name: 'B 목록' }],
      hasNext: false,
      totalCount: 1,
    })
    act(() => startAuthenticatedSession('account-b', 2))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    await screen.findByRole('button', { name: 'B 목록 컬렉션 열기' })
    await act(async () =>
      finish({ collectionId: 8, visibility: 'public', owner: true }),
    )
    expect(copyUrlToClipboard).not.toHaveBeenCalled()
    expect(showToast).not.toHaveBeenCalled()
    expect(router.state.location.pathname).toBe('/saved')
  })

  it('제품 목록에서 생성·수정·삭제 API를 호출하고 성공 후 갱신된 목록으로 복귀한다', async () => {
    setAccessToken('test-session')
    let detail = {
      collectionId: 42,
      name: '새 여행',
      color: 'red',
      description: '',
      visibility: 'public' as const,
      owner: true,
    }
    let exists = false
    vi.mocked(getCollections).mockImplementation(async () => ({
      collections: exists ? [detail] : [],
      totalCount: exists ? 1 : 0,
      hasNext: false,
    }))
    vi.mocked(getCollection).mockImplementation(async () => detail)
    vi.mocked(createCollection).mockImplementation(async () => {
      exists = true
      return detail
    })
    vi.mocked(updateCollection).mockImplementation(async (_id, body) => {
      detail = { ...detail, description: body.description ?? '' }
      return detail
    })
    vi.mocked(deleteCollection)
      .mockRejectedValueOnce(new Error('offline'))
      .mockImplementationOnce(async () => {
        exists = false
      })
    const { router } = await renderRoute('/saved')
    const user = userEvent.setup()
    await user.click(
      await screen.findByRole('button', { name: '새 컬렉션 만들기' }),
    )
    await user.type(await screen.findByLabelText('컬렉션명'), '새 여행')
    await user.click(screen.getByRole('radio', { name: '빨강' }))
    await user.click(screen.getByRole('button', { name: '만들기' }))
    expect(
      await screen.findByRole('button', { name: '새 여행 컬렉션 열기' }),
    ).toBeVisible()
    expect(router.state.location.pathname).toBe('/saved')
    expect(createCollection).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '새 여행 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '수정하기' }))
    await user.type(await screen.findByLabelText('설명'), '설명 수정')
    await user.click(screen.getByRole('button', { name: '저장하기' }))
    expect(
      await screen.findByRole('button', { name: '새 여행 컬렉션 열기' }),
    ).toBeVisible()
    expect(updateCollection).toHaveBeenCalledExactlyOnceWith(42, {
      description: '설명 수정',
    })
    await user.click(screen.getByRole('button', { name: '새 여행 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '삭제하기' }))
    await user.click(screen.getByRole('button', { name: '삭제하기' }))
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(
      screen.getByRole('button', { name: '새 여행 컬렉션 열기', hidden: true }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '삭제하기' }))
    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    )
    expect(await screen.findByText('총 0개')).toBeVisible()
    expect(deleteCollection).toHaveBeenLastCalledWith(42)
  })

  it.each([
    ['/saved', '저장 컬렉션', false],
    ['/saved/collections/8', 'API 여행', false],
    ['/saved/collections/new', '새 컬렉션 만들기', true],
    ['/saved/collections/8/edit', '컬렉션 수정', true],
    ['/saved/collections/8/restaurants/edit', '컬렉션 편집', true],
  ] as const)(
    '실제 appRoutes에서 인증된 사용자의 %s를 올바른 레이아웃으로 연다',
    async (path, name, form) => {
      setAccessToken('test-session')
      await renderRoute(path)
      expect(
        await screen.findByRole(form ? 'region' : 'heading', { name }),
      ).toBeVisible()
      if (form) expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
      else
        expect(screen.getByRole('button', { name: '저장' })).toHaveAttribute(
          'aria-current',
          'page',
        )
    },
  )
})
