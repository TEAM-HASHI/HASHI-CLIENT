import '@testing-library/jest-dom/vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PropsWithChildren } from 'react'

import { ROUTES } from '@/app/router/path'
import { appRoutes } from '@/app/router/routes'
import { getAuthMe } from '@/features/auth/api/getAuthMe'
import { HttpStatusError } from '@/shared/api/apiError'
import { requestTokenReissue } from '@/shared/api/requestTokenReissue'
import { clearAuthSession } from '@/shared/auth/authSession'
import { createQueryClient } from '@/shared/lib/queryClient'
import { clearMapSession } from '@/pages/map/utils/mapSession'
import {
  createMapLocationFixture,
  createMapPageFixture,
  createMapStoreFixture,
  createMapSummaryFixture,
  mapRegionsFixture,
} from '@/pages/map/__tests__/mapApiFixtures'
import type { MapPageRequest } from '@/pages/map/api/mapApiTypes'

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

vi.mock('@/features/auth/api/getAuthMe', () => ({
  getAuthMe: vi.fn(),
}))

vi.mock('@/shared/api/requestTokenReissue', () => ({
  requestTokenReissue: vi.fn(),
}))

const renderRoute = (initialEntry: string) => {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [initialEntry],
  })
  const queryClient = createQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('appRoutes', () => {
  beforeEach(() => {
    clearAuthSession()
    vi.mocked(requestTokenReissue).mockRejectedValue(new HttpStatusError(401))
    vi.mocked(getAuthMe).mockRejectedValue(new HttpStatusError(401))
    clearMapSession()
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key')
    vi.stubEnv('VITE_GOOGLE_MAPS_MAP_ID', 'DEMO_MAP_ID')
  })
  afterEach(() => {
    cleanup()
    clearAuthSession()
    clearMapSession()
    vi.unstubAllEnvs()
    document.body.style.overflow = ''
  })

  it('renders the public API-backed map and bottom navigation on direct entry', async () => {
    renderRoute(ROUTES.map)

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
      renderRoute(ROUTES.map)
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
})
vi.mock('@/pages/map/api/getMapRestaurantSaves', () => ({
  getMapRestaurantSaveCounts: vi.fn(async () => ({})),
  getMyMapRestaurantSaves: vi.fn(async () => ({})),
}))
