import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'

import { RestaurantLocationMap } from '@/features/restaurantDetail/components/RestaurantLocationMap'
import { getMapRestaurantLocation } from '@/pages/map/api/getMapRestaurantLocation'
import { HttpStatusError } from '@/shared/api/apiError'

vi.mock('@/pages/map/api/getMapRestaurantLocation', () => ({
  getMapRestaurantLocation: vi.fn(),
}))
vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: PropsWithChildren) => children,
  APILoadingStatus: {
    LOADED: 'LOADED',
    FAILED: 'FAILED',
    AUTH_FAILURE: 'AUTH_FAILURE',
  },
  useApiLoadingStatus: () => 'LOADED',
  Map: () => <div data-testid="location-map-canvas" />,
  AdvancedMarker: () => null,
}))

const RouteState = () => {
  const location = useLocation()
  return (
    <output aria-label="route state">{JSON.stringify(location.state)}</output>
  )
}

const renderMap = (state?: Record<string, unknown>) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter
        initialEntries={[{ pathname: '/restaurants/today', state }]}
      >
        <RestaurantLocationMap restaurantId="10" />
        <RouteState />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return client
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetAllMocks()
})

it('keeps a location failure local instead of rendering a map with invented coordinates', async () => {
  vi.mocked(getMapRestaurantLocation).mockRejectedValue(
    new HttpStatusError(404),
  )
  renderMap()
  expect(
    await screen.findByText('현재 표시할 수 있는 식당 위치가 없어요.'),
  ).toBeVisible()
  expect(screen.queryByTestId('location-map-canvas')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: '다시 시도' })).toBeVisible()
})

it('removes expired coordinates and their attributions together', async () => {
  vi.useFakeTimers()
  vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key')
  vi.stubEnv('VITE_GOOGLE_MAPS_MAP_ID', 'test-map-id')
  vi.mocked(getMapRestaurantLocation).mockResolvedValue({
    position: { lat: 35.68, lng: 139.75 },
    validUntil: new Date(Date.now() + 1000).toISOString(),
    attributions: [{ displayName: 'Provider', uri: 'https://example.com' }],
  })
  const client = renderMap()
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10)
  })
  expect(screen.getByTestId('location-map-canvas')).toBeVisible()
  expect(screen.getByRole('link', { name: 'Provider' })).toBeVisible()
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000)
  })
  expect(screen.queryByTestId('location-map-canvas')).not.toBeInTheDocument()
  expect(
    screen.queryByRole('link', { name: 'Provider' }),
  ).not.toBeInTheDocument()
  expect(
    screen.getByText('현재 표시할 수 있는 식당 위치가 없어요.'),
  ).toBeVisible()
  client.clear()
})

it('handles authentication failure and preserves the current restaurant and scroll before retrying the SDK', async () => {
  vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key')
  vi.stubEnv('VITE_GOOGLE_MAPS_MAP_ID', 'test-map-id')
  const reload = vi.fn()
  vi.stubGlobal('location', { reload })
  vi.stubGlobal('scrollY', 640)
  vi.mocked(getMapRestaurantLocation).mockResolvedValue({
    position: { lat: 35.68, lng: 139.75 },
    validUntil: new Date(Date.now() + 60_000).toISOString(),
    attributions: [],
  })
  const previous = vi.fn()
  const authWindow = window as Window & { gm_authFailure?: () => void }
  authWindow.gm_authFailure = previous
  const client = renderMap({ source: 'detail' })
  await screen.findByTestId('location-map-canvas')
  act(() => authWindow.gm_authFailure?.())
  expect(previous).toHaveBeenCalledOnce()
  expect(screen.getByText('지도를 불러오지 못했어요.')).toBeVisible()
  expect(screen.queryByTestId('location-map-canvas')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
  expect(JSON.parse(screen.getByLabelText('route state').textContent!)).toEqual(
    {
      source: 'detail',
      restaurantId: 10,
      activeTab: 'info',
      mapRetryScrollY: 640,
    },
  )
  expect(reload).toHaveBeenCalledOnce()
  cleanup()
  expect(authWindow.gm_authFailure).toBe(previous)
  delete authWindow.gm_authFailure
  client.clear()
})

it('restores the retry scroll once and removes the restoration marker', async () => {
  const scrollTo = vi.fn()
  vi.stubGlobal('scrollTo', scrollTo)
  vi.mocked(getMapRestaurantLocation).mockRejectedValue(
    new HttpStatusError(404),
  )
  const client = renderMap({ restaurantId: 10, mapRetryScrollY: 640 })
  await vi.waitFor(() => {
    expect(scrollTo).toHaveBeenCalledWith({ top: 640, behavior: 'instant' })
    expect(
      JSON.parse(screen.getByLabelText('route state').textContent!),
    ).toEqual({
      restaurantId: 10,
    })
  })
  client.clear()
})
