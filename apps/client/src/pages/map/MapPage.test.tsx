import {
  cleanup,
  act,
  fireEvent,
  render as renderComponent,
  screen,
  within,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PropsWithChildren, ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { useMap } from '@vis.gl/react-google-maps'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MapPage } from '@/pages/map/MapPage'
import { getMapRegions } from '@/pages/map/api/getMapRegions'
import { getMapRestaurants } from '@/pages/map/api/getMapRestaurants'
import { getMapRestaurantLocation } from '@/pages/map/api/getMapRestaurantLocation'
import { getRestaurantMenus } from '@/features/restaurantDetail/api/getRestaurantMenus'
import type { MapRestaurantPage } from '@/pages/map/api/mapApiTypes'
import {
  createMapLocationFixture,
  createMapPageFixture,
  createMapStoreFixture,
  createMapSummaryFixture,
  mapRegionsFixture,
} from '@/pages/map/__tests__/mapApiFixtures'
import { ApiError } from '@/shared/api/apiError'
import mapToastWarning from '@/shared/assets/icons/map-toast-warning.svg'
import { ToastRegion, toastQueue } from '@hashi/hds-ui'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { clearMapSession, writeMapSession } from '@/pages/map/utils/mapSession'

vi.mock('@/pages/map/api/getMapRegions', () => ({ getMapRegions: vi.fn() }))
vi.mock('@/pages/map/api/getMapRestaurantSaves', () => ({
  getMapRestaurantSaveCounts: vi.fn(async () => ({})),
  getMyMapRestaurantSaves: vi.fn(async () => ({})),
}))
vi.mock('@/pages/map/api/getMapRestaurants', () => ({
  getMapRestaurants: vi.fn(),
}))
vi.mock('@/pages/map/api/getMapRestaurantLocation', () => ({
  getMapRestaurantLocation: vi.fn(),
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

const render = (ui: ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return renderComponent(ui, {
    wrapper: ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  })
}

// Only the external Google SDK is replaced; page state, markers and panels stay real.
type SdkMap = NonNullable<ReturnType<typeof useMap>>
const sdkState = vi.hoisted(() => ({
  status: 'LOADED',
  map: null as SdkMap | null,
  onIdle: undefined as ((event: { map: SdkMap }) => void) | undefined,
}))
vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: PropsWithChildren) => children,
  Map: ({
    children,
    onIdle,
  }: PropsWithChildren<{ onIdle: typeof sdkState.onIdle }>) => {
    sdkState.onIdle = onIdle
    return children
  },
  AdvancedMarker: ({ children }: PropsWithChildren) => children,
  useApiLoadingStatus: () => sdkState.status,
  APILoadingStatus: {
    LOADED: 'LOADED',
    FAILED: 'FAILED',
    AUTH_FAILURE: 'AUTH_FAILURE',
  },
  useMap: () => sdkState.map,
}))

beforeEach(() => {
  vi.mocked(getRestaurantMenus)
    .mockReset()
    .mockResolvedValue({ menus: [], hasNext: false })
  vi.mocked(getMapRegions).mockReset().mockResolvedValue(mapRegionsFixture)
  vi.mocked(getMapRestaurants)
    .mockReset()
    .mockImplementation(async (request) => createMapPageFixture(request))
  vi.mocked(getMapRestaurantLocation)
    .mockReset()
    .mockImplementation(async (id) => createMapLocationFixture(id))
  sdkState.status = 'LOADED'
  sdkState.map = null
  sdkState.onIdle = undefined
  clearMapSession()
  vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key')
  vi.stubEnv('VITE_GOOGLE_MAPS_MAP_ID', 'DEMO_MAP_ID')
  // jsdom has no layout; keep the real DragPanel and supply its measured container.
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
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
})
afterEach(() => {
  cleanup()
  toastQueue.clear()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('MapPage API integration', () => {
  it('opens menu detail with map context and restores the expanded menu tab on browser back', async () => {
    vi.mocked(getRestaurantMenus).mockResolvedValue({
      menus: [{ menuId: 11, name: '지도 메뉴', price: 1000, currency: 'JPY' }],
      hasNext: false,
    })
    const user = userEvent.setup()
    const MenuDestination = () => {
      const route = useLocation()
      const navigate = useNavigate()
      return (
        <>
          <output>
            {route.pathname} {JSON.stringify(route.state)}
          </output>
          <button onClick={() => navigate(-1)}>지도 돌아가기</button>
          <button
            onClick={() =>
              navigate('/map', {
                replace: true,
                state: { mapRestaurantId: '1', activeTab: 'review' },
              })
            }
          >
            지도 리뷰로 돌아가기
          </button>
        </>
      )
    }
    render(
      <MemoryRouter initialEntries={['/map']}>
        <Routes>
          <Route path="/map" element={<MapPage />} />
          <Route
            path="/restaurants/:restaurantId/menus/:menuId"
            element={<MenuDestination />}
          />
        </Routes>
      </MemoryRouter>,
    )
    await user.click(
      await screen.findByRole('button', {
        name: '코코네 돈카츠 신도심점 상세 보기',
      }),
    )
    await user.click(
      screen.getByRole('slider', { name: '식당 상세 높이 조절' }),
    )
    await user.keyboard('{End}')
    await user.click(await screen.findByRole('tab', { name: '메뉴' }))
    await user.click(await screen.findByRole('button', { name: /지도 메뉴/ }))
    expect(screen.getByRole('status')).toHaveTextContent(
      '/restaurants/1/menus/11 {"source":"map"}',
    )
    await user.click(
      screen.getByRole('button', { name: '지도 리뷰로 돌아가기' }),
    )
    expect(await screen.findByRole('tab', { name: /리뷰/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await user.click(screen.getByRole('tab', { name: '메뉴' }))
    await user.click(await screen.findByRole('button', { name: /지도 메뉴/ }))
    await user.click(screen.getByRole('button', { name: '지도 돌아가기' }))
    expect(await screen.findByRole('tab', { name: '메뉴' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      await screen.findByRole('button', { name: /지도 메뉴/ }),
    ).toBeVisible()
  })
  it('shows a retryable regions configuration failure without sample restaurants', async () => {
    vi.mocked(getMapRegions).mockRejectedValueOnce(
      new ApiError(
        {
          success: false,
          code: 'RESTAURANT-017',
          message: '지도 설정이 준비되지 않았습니다.',
          data: null,
          timestamp: '2026-10-19T00:00:00Z',
          path: '/api/v1/restaurants/map/regions',
        },
        503,
      ),
    )
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(
      screen.queryByRole('button', {
        name: '코코네 돈카츠 신도심점 상세 보기',
      }),
    ).not.toBeInTheDocument()
    expect(getMapRestaurants).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '다시 시도하기' }))
    expect(
      await screen.findByRole('list', { name: '식당 검색 결과' }),
    ).toBeVisible()
  })
  it.each([false, true])(
    'restores the preselection fractional-zoom display mode (pins: %s) after leaving and returning',
    async (isExploring) => {
      const user = userEvent.setup()
      writeMapSession({
        conditions: {
          keyword: '',
          category: 'all',
          areaCode: null,
          sort: 'recommended',
        },
        camera: {
          center: { lat: 35.7, lng: 139.7 },
          zoom: 11.5,
          minZoom: 11,
          bounds: { north: 36, south: 35, east: 140, west: 139 },
        },
        searchBounds: null,
        selectedId: null,
        stage: 'normal',
        detailStage: 'normal',
        isExploring,
      })
      const view = render(
        <MemoryRouter>
          <MapPage />
        </MemoryRouter>,
      )
      await user.click(
        await screen.findByRole('button', {
          name: '코코네 돈카츠 신도심점 상세 보기',
        }),
      )
      view.unmount()
      render(
        <MemoryRouter>
          <MapPage />
        </MemoryRouter>,
      )
      await user.click(
        await screen.findByRole('button', { name: '선택한 식당 닫기' }),
      )
      if (isExploring) {
        expect(
          screen.queryByRole('button', { name: '우에노 식당 보기' }),
        ).not.toBeInTheDocument()
      } else {
        expect(
          screen.getByRole('button', { name: '우에노 식당 보기' }),
        ).toBeVisible()
      }
    },
  )

  it('returns to the initial bounds when detail was opened before the SDK loaded', async () => {
    const user = userEvent.setup()
    sdkState.status = 'LOADING'
    const view = render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    await user.click(
      await screen.findByRole('button', {
        name: '코코네 돈카츠 신도심점 상세 보기',
      }),
    )
    let idle = () => {}
    let zoom = 11
    const fitBounds = vi.fn()
    const map = {
      fitBounds,
      addListener: (_name: string, callback: () => void) => {
        idle = callback
        return { remove: vi.fn() }
      },
      getZoom: () => zoom,
      setZoom: (value: number) => {
        zoom = value
      },
      setOptions: vi.fn(),
      panTo: vi.fn(),
      moveCamera: vi.fn(),
      getBounds: () => ({
        toJSON: () => ({ north: 36, south: 35, east: 140, west: 139 }),
      }),
      getCenter: () => ({ toJSON: () => ({ lat: 35.7, lng: 139.7 }) }),
    } as unknown as SdkMap
    sdkState.map = map
    sdkState.status = 'LOADED'
    view.rerender(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    act(() => idle())
    expect(zoom).toBe(15)
    act(() => sdkState.onIdle?.({ map }))
    const initialFit = fitBounds.mock.calls[0]
    fitBounds.mockClear()
    await user.click(screen.getByRole('button', { name: '선택한 식당 닫기' }))
    expect(fitBounds).toHaveBeenCalledExactlyOnceWith(...initialFit)
    expect(
      screen.getByRole('button', { name: '우에노 식당 보기' }),
    ).toBeVisible()
    expect(screen.getByRole('button', { name: '정렬: 추천순' })).toBeVisible()
  })

  it('reopens results when a successful refresh finishes after the panel collapsed', async () => {
    const user = userEvent.setup()
    const source = vi.mocked(getMapRestaurants)
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    await screen.findByRole('list', { name: '식당 검색 결과' })
    const existing = createMapPageFixture()
    let resolve!: (value: MapRestaurantPage) => void
    source.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    await user.click(screen.getByRole('button', { name: '카페' }))
    const handle = screen.getByRole('slider', { name: '식당 목록 높이 조절' })
    handle.focus()
    await user.keyboard('{Home}')
    expect(handle).toHaveAttribute('aria-valuenow', '30')
    await act(async () => resolve(existing))
    await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '304'))
  })
  it('keeps an empty region panel collapsed even when expanded by keyboard', async () => {
    const user = userEvent.setup()
    const source = vi.mocked(getMapRestaurants)
    const view = render(
      <MemoryRouter>
        <MapPage />
        <ToastRegion />
      </MemoryRouter>,
    )
    await screen.findByRole('list', { name: '식당 검색 결과' })
    source.mockResolvedValueOnce({ ...createMapPageFixture(), restaurants: [] })
    await user.click(screen.getByRole('button', { name: '우에노 식당 보기' }))
    await screen.findByText('이 지역에는 아직 등록된 맛집이 없어요.')
    const handle = screen.getByRole('slider', { name: '식당 목록 높이 조절' })
    handle.focus()
    await user.keyboard('{End}')
    expect(handle).toHaveAttribute('aria-valuenow', '30')
    expect(
      screen.queryByRole('button', { name: '지도로 보기' }),
    ).not.toBeInTheDocument()
    view.unmount()
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    const restoredHandle = await screen.findByRole('slider', {
      name: '식당 목록 높이 조절',
    })
    restoredHandle.focus()
    await user.keyboard('{End}')
    expect(restoredHandle).toHaveAttribute('aria-valuenow', '30')
  })
  it('opens a retryable failure after empty results instead of keeping the sheet locked', async () => {
    const source = vi.mocked(getMapRestaurants)
    source.mockResolvedValueOnce({ ...createMapPageFixture(), restaurants: [] })
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    const handle = await screen.findByRole('slider', {
      name: '식당 목록 높이 조절',
    })
    await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '30'))
    source.mockRejectedValueOnce(
      new ApiError(
        {
          success: false,
          code: 'RESTAURANT-017',
          message: 'unavailable',
          data: null,
          timestamp: '2026-10-22T00:00:00Z',
          path: '/api/v1/restaurants/map',
        },
        503,
      ),
    )
    await user.click(screen.getByRole('button', { name: '카페' }))
    const retry = await screen.findByRole('button', { name: '다시 시도하기' })
    expect(retry).toBeVisible()
    expect(
      screen.getByRole('slider', { name: '식당 목록 높이 조절' }),
    ).not.toHaveAttribute('aria-valuenow', '30')
    await user.click(retry)
    expect(
      await screen.findByRole('list', { name: '식당 검색 결과' }),
    ).toBeVisible()
  })

  it.each(['initial', 'refresh'])(
    'opens a failed %s request after the panel was collapsed and retries successfully',
    async (reason) => {
      const user = userEvent.setup()
      let rejectRequest!: (reason: Error) => void
      const source = vi.mocked(getMapRestaurants)
      const pending = () =>
        new Promise<MapRestaurantPage>((_, reject) => {
          rejectRequest = reject
        })
      if (reason === 'initial') source.mockImplementationOnce(pending)
      render(
        <MemoryRouter>
          <MapPage />
        </MemoryRouter>,
      )
      if (reason === 'refresh') {
        await screen.findByRole('list', { name: '식당 검색 결과' })
        source.mockImplementationOnce(pending)
        await user.click(screen.getByRole('button', { name: '카페' }))
      }
      const handle = await screen.findByRole('slider', {
        name: '식당 목록 높이 조절',
      })
      handle.focus()
      await user.keyboard('{Home}')
      await act(async () => rejectRequest(new Error('network')))
      const retry = await screen.findByRole('button', { name: '다시 시도하기' })
      expect(handle).not.toHaveAttribute('aria-valuenow', '30')
      await user.click(retry)
      expect(
        await screen.findByRole('list', { name: '식당 검색 결과' }),
      ).toBeVisible()
    },
  )
  it('keeps search available but hides restaurant panels and map actions when the map fails', async () => {
    sdkState.status = 'FAILED'
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    expect(await screen.findByText('지도를 불러오지 못했어요!')).toBeVisible()
    expect(screen.getByRole('searchbox')).toBeVisible()
    expect(
      screen.queryByRole('region', { name: '지도 식당 목록' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '저장 목록 보기' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다시 시도하기' })).toBeVisible()
  })
  it('shows an empty search toast and keeps only the non-expandable panel handle', async () => {
    const user = userEvent.setup()
    toastQueue.clear()
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/map', state: { source: 'map', keyword: '없는 식당' } },
        ]}
      >
        <MapPage />
        <ToastRegion />
      </MemoryRouter>,
    )
    const message = await within(await screen.findByRole('alert')).findByText(
      '조건에 맞는 맛집이 없어요.',
    )
    const toast = message.closest('[role="alert"]')?.parentElement
    expect(toast?.querySelector('img')).toHaveAttribute('src', mapToastWarning)
    expect(
      screen.queryByText('검색 조건에 맞는 식당이 없어요.'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '검색 조건 초기화' }),
    ).not.toBeInTheDocument()
    const handle = screen.getByRole('slider', { name: '식당 목록 높이 조절' })
    expect(handle).toHaveAttribute('aria-valuenow', '30')
    handle.focus()
    await user.keyboard('{End}')
    expect(handle).toHaveAttribute('aria-valuenow', '30')
    expect(
      within(
        screen.getByRole('region', { name: '지도 식당 목록' }),
      ).queryByRole('status'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '지도로 보기' }),
    ).not.toBeInTheDocument()
    toastQueue.clear()
  })
  it('locks an empty category to the handle and reopens when clearing the category returns results', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <MapPage />
        <ToastRegion />
      </MemoryRouter>,
    )
    await screen.findByRole('list', { name: '식당 검색 결과' })
    vi.mocked(getMapRestaurants).mockResolvedValueOnce({
      ...createMapPageFixture(),
      restaurants: [],
    })
    await user.click(screen.getByRole('button', { name: '카페' }))
    await screen.findByText('조건에 맞는 맛집이 없어요.')
    const handle = screen.getByRole('slider', { name: '식당 목록 높이 조절' })
    handle.focus()
    await user.keyboard('{End}')
    expect(handle).toHaveAttribute('aria-valuenow', '30')
    expect(screen.getByRole('button', { name: '카페' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByRole('button', { name: '전체' }))
    await screen.findByRole('list', { name: '식당 검색 결과' })
    expect(
      screen.getByRole('slider', { name: '식당 목록 높이 조절' }),
    ).not.toHaveAttribute('aria-valuenow', '30')
  })
  it('applies a returned search without losing the category, then clears only the keyword', async () => {
    const user = userEvent.setup()
    writeMapSession({
      conditions: {
        keyword: '',
        category: 'cafe',
        sort: 'recommended',
        areaCode: null,
      },
      camera: null,
      searchBounds: null,
      selectedId: null,
      stage: 'normal',
      detailStage: 'normal',
      isExploring: true,
    })
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/map', state: { source: 'map', keyword: '없는 식당' } },
        ]}
      >
        <MapPage />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(
        screen.getByRole('slider', { name: '식당 목록 높이 조절' }),
      ).toHaveAttribute('aria-valuenow', '304'),
    )
    expect(screen.getByRole('button', { name: '카페' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByRole('button', { name: '지도 검색어 지우기' }))
    await screen.findByRole('list', { name: '식당 검색 결과' })
    expect(screen.getByRole('searchbox')).toHaveValue('')
    expect(screen.getByRole('button', { name: '카페' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
  it('restores category and panel after leaving and returning', async () => {
    const user = userEvent.setup()
    const view = render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    await screen.findByRole('list', { name: '식당 검색 결과' })
    await user.click(screen.getByRole('button', { name: '카페' }))
    const slider = screen.getByRole('slider', { name: '식당 목록 높이 조절' })
    slider.focus()
    await user.keyboard('{End}')
    view.unmount()
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: '카페' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      await screen.findByRole('button', { name: '지도로 보기' }),
    ).toBeVisible()
  })
  it('returns from an expanded list to the map without clearing filters or scroll', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    await screen.findByRole('list', { name: '식당 검색 결과' })
    expect(
      screen.queryByRole('button', { name: '지도로 보기' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '카페' }))
    const slider = screen.getByRole('slider', { name: '식당 목록 높이 조절' })
    slider.focus()
    await user.keyboard('{End}')
    const scroller = screen
      .getByRole('list', { name: '식당 검색 결과' })
      .closest('[data-map-list]')!.parentElement!
    fireEvent.scroll(scroller, { target: { scrollTop: 80 } })
    await user.click(screen.getByRole('button', { name: '지도로 보기' }))
    expect(slider).toHaveAttribute('aria-valuenow', '30')
    expect(slider).toHaveFocus()
    expect(screen.getByRole('button', { name: '카페' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      screen.queryByRole('button', { name: '지도로 보기' }),
    ).not.toBeInTheDocument()
    await user.keyboard('{ArrowUp}')
    expect(scroller.scrollTop).toBe(80)
    expect(
      screen.getByRole('button', { name: '도쿄 카페 미리보기 상세 보기' }),
    ).toBeVisible()
  })

  it('renders API results without a sample disclaimer and keeps the real panel keyboard-operable', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    await screen.findByRole('list', { name: '식당 검색 결과' })
    expect(
      screen.queryByText('샘플 식당 · 실제 매장 위치/예약 미연동'),
    ).not.toBeInTheDocument()
    const slider = screen.getByRole('slider', { name: '식당 목록 높이 조절' })
    slider.focus()
    await user.keyboard('{Home}')
    expect(slider).toHaveAttribute('aria-valuenow', '30')
    expect(
      screen.queryByRole('button', {
        name: '코코네 돈카츠 신도심점 상세 보기',
      }),
    ).not.toBeInTheDocument()
    await user.keyboard('{ArrowUp}')
    expect(
      screen.getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' }),
    ).toBeVisible()
  })
  it('filters categories, toggles back, and resets an empty submitted search', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    await screen.findByRole('list', { name: '식당 검색 결과' })
    await user.click(screen.getByRole('button', { name: '카페' }))
    expect(
      screen.queryByRole('button', {
        name: '코코네 돈카츠 신도심점 상세 보기',
      }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '카페' }))
    expect(
      screen.getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' }),
    ).toBeVisible()
    expect(screen.getByRole('searchbox')).toHaveAttribute('readonly')
  })
  it('sorts the server list and closes the sort menu on selection', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    await screen.findByRole('list', { name: '식당 검색 결과' })
    await user.click(screen.getByRole('button', { name: '정렬: 추천순' }))
    await user.click(screen.getByRole('menuitemradio', { name: '별점순' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '정렬: 별점순' })).toHaveFocus()
    const list = screen.getByRole('list', { name: '식당 검색 결과' })
    expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent(
      '히마와리 스시 신도심점',
    )
  })
  it('preserves the list scroll when collapsing but resets it after a filter change', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    await screen.findByRole('list', { name: '식당 검색 결과' })
    const list = screen.getByRole('list', { name: '식당 검색 결과' })
    const scroller = list.closest('[data-map-list]')!.parentElement!
    fireEvent.scroll(scroller, { target: { scrollTop: 180 } })
    const slider = screen.getByRole('slider', { name: '식당 목록 높이 조절' })
    slider.focus()
    await user.keyboard('{Home}{ArrowUp}')
    expect(scroller.scrollTop).toBe(180)
    await user.click(screen.getByRole('button', { name: '카페' }))
    expect(
      screen
        .getByRole('list', { name: '식당 검색 결과' })
        .closest('[data-map-list]')!.parentElement!.scrollTop,
    ).toBe(0)
  })

  it('opens a selected restaurant, expands details, switches tabs and returns to its filtered list', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    await screen.findByRole('list', { name: '식당 검색 결과' })
    await user.click(screen.getByRole('button', { name: '시부야 식당 보기' }))
    await user.click(
      screen.getByRole('button', { name: '야키니쿠 리키마루 상세 보기' }),
    )
    const slider = screen.getByRole('slider', { name: '식당 상세 높이 조절' })
    slider.focus()
    await user.keyboard('{End}')
    expect(
      screen.getByRole('heading', { name: '야키니쿠 리키마루' }),
    ).toBeVisible()
    await user.click(screen.getByRole('tab', { name: '메뉴' }))
    expect(await screen.findByText('메뉴 리스트를 준비중이에요.')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '식당 상세 닫기' }))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '정렬: 추천순' }),
      ).toHaveFocus(),
    )
    expect(
      screen.getByRole('button', { name: '야키니쿠 리키마루 상세 보기' }),
    ).toBeVisible()
    expect(
      screen.queryByRole('button', {
        name: '코코네 돈카츠 신도심점 상세 보기',
      }),
    ).not.toBeInTheDocument()
  })

  it('clears the selected restaurant when the category changes', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    await screen.findByRole('list', { name: '식당 검색 결과' })
    await user.click(
      screen.getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' }),
    )
    await user.click(screen.getByRole('button', { name: '카페' }))
    expect(
      screen.queryByRole('slider', { name: '식당 상세 높이 조절' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '도쿄 카페 미리보기 상세 보기' }),
    ).toBeVisible()
  })

  it('opens the chosen photo and restores focus to its thumbnail after Escape', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    await screen.findByRole('list', { name: '식당 검색 결과' })
    await user.click(
      screen.getByRole('button', { name: '야키니쿠 리키마루 상세 보기' }),
    )
    const thumbnail = screen.getByRole('button', {
      name: '야키니쿠 리키마루 사진 2 보기',
    })
    await user.click(thumbnail)
    expect(
      screen.getByRole('dialog', { name: '식당 사진 상세보기' }),
    ).toBeVisible()
    await user.keyboard('{Escape}')
    expect(
      screen.queryByRole('dialog', { name: '식당 사진 상세보기' }),
    ).not.toBeInTheDocument()
    await waitFor(() => expect(thumbnail).toHaveFocus())
  })

  it('keeps unsupported reservation actions behind the coming-soon dialog', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>,
    )
    await screen.findByRole('list', { name: '식당 검색 결과' })
    await user.click(
      screen.getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' }),
    )
    screen.getByRole('slider', { name: '식당 상세 높이 조절' }).focus()
    await user.keyboard('{End}')
    await user.click(screen.getByRole('button', { name: '예약하기' }))
    expect(screen.getByRole('dialog')).toHaveTextContent(
      '서비스를 준비하고 있어요.',
    )
  })
})
