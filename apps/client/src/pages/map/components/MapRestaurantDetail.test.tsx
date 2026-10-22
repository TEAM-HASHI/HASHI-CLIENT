import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { getRestaurantMenus } from '@/features/restaurantDetail/api/getRestaurantMenus'
import { getRestaurantPhotos } from '@/features/restaurantDetail/api/getRestaurantPhotos'
import { getRestaurantReviews } from '@/features/restaurantDetail/api/getRestaurantReviews'
import { getRestaurantStoreInformation } from '@/features/restaurantDetail/api/getRestaurantStoreInformation'
import {
  getRestaurantSummary,
  type RestaurantSummary,
} from '@/features/restaurantDetail/api/getRestaurantSummary'
import {
  restaurantStoreInformationQueryOptions,
  restaurantSummaryQueryOptions,
} from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import { restaurantDetailQueryKeys } from '@/features/restaurantDetail/queries/restaurantDetailQueryKeys'
import { MapRestaurantDetail } from '@/pages/map/components/MapRestaurantDetail'
import type { MapPanelStage, MapRestaurant } from '@/pages/map/types'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'
import spinner from '@/shared/assets/images/map/loading-spinner.svg'

vi.mock('@/features/restaurantDetail/api/getRestaurantSummary', () => ({
  getRestaurantSummary: vi.fn(),
}))
vi.mock(
  '@/features/restaurantDetail/api/getRestaurantStoreInformation',
  () => ({ getRestaurantStoreInformation: vi.fn() }),
)
vi.mock('@/features/restaurantDetail/api/getRestaurantMenus', () => ({
  getRestaurantMenus: vi.fn(),
}))
vi.mock('@/features/restaurantDetail/api/getRestaurantPhotos', () => ({
  getRestaurantPhotos: vi.fn(),
}))
vi.mock('@/features/restaurantDetail/api/getRestaurantReviews', () => ({
  getRestaurantReviews: vi.fn(),
}))
vi.mock('@/features/restaurantDetail/api/getRestaurantMenu', () => ({
  getRestaurantMenu: vi.fn(),
}))
vi.mock('@/features/restaurantDetail/api/getRestaurantMain', () => ({
  getRestaurantMain: vi.fn(),
}))
vi.mock(
  '@/features/restaurantDetail/api/getRandomRestaurantRecommendation',
  () => ({ getRandomRestaurantRecommendation: vi.fn() }),
)

const restaurant: MapRestaurant = {
  id: '10',
  name: '목록 식당',
  areaCode: 'ueno',
  category: 'restaurant',
  cuisine: '일식',
  rating: 3,
  reviewCount: 1,
  saveCount: 0,
  recommendationRank: 1,
  menuKeywords: [],
  images: ['https://images.test/list.jpg'],
  hours: '영업시간 정보 없음',
  price: '가격 정보 없음',
  description: '목록 설명',
  address: '목록 주소',
  position: { lat: 35.7, lng: 139.7 },
}
const summary: RestaurantSummary = {
  restaurantId: 10,
  name: '서버 식당',
  address: '도쿄 실제 주소',
  imageUrls: ['https://images.test/hero.jpg'],
  reservationFee: 4000,
  rating: 4.5,
  reviewCount: 2,
  foodCategory: '돈카츠',
  summary: '서버 요약',
}
const menu = {
  menuId: 1,
  name: '특상 돈카츠',
  description: '흑돼지',
  currency: 'JPY',
  price: 1500,
  main: true,
}
const review = {
  reviewId: 1,
  reviewerNickname: '실제 방문자',
  rating: 5,
  content: '맛있는 식당',
  createdAt: '2026-10-19T00:00:00Z',
  keywords: [],
  previewImageUrls: [],
}

const setup = (stage: MapPanelStage = 'normal') => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
  })
  const callbacks = {
    onStageChange: vi.fn(),
    onClose: vi.fn(),
    onPhotoSelect: vi.fn(),
    onUnavailable: vi.fn(),
    onLoadError: vi.fn(),
    onPressMenuItem: vi.fn(),
  }
  const element = (nextStage: MapPanelStage, selected = restaurant) => (
    <QueryClientProvider client={client}>
      <MapRestaurantDetail
        restaurant={selected}
        stage={nextStage}
        {...callbacks}
      />
    </QueryClientProvider>
  )
  const view = render(element(stage))
  return {
    ...callbacks,
    ...view,
    client,
    update: (nextStage: MapPanelStage, selected = restaurant) =>
      view.rerender(element(nextStage, selected)),
  }
}

beforeEach(() => {
  vi.mocked(getRestaurantPhotos).mockResolvedValue({
    photos: [
      {
        id: 'REVIEW:1',
        imageUrl: '/gallery.jpg',
        thumbnailUrl: '/gallery.jpg',
        width: 800,
        height: 600,
      },
    ],
    counts: { all: 1, representative: 0, menu: 0, review: 1 },
  })
  vi.mocked(getRestaurantSummary).mockResolvedValue(summary)
  vi.mocked(getRestaurantStoreInformation).mockResolvedValue({
    restaurantId: 10,
    description: '실제 가게 설명',
    businessHours: [
      {
        dayOfWeek: 'MONDAY',
        openTime: '11:00',
        closeTime: '20:00',
        closed: false,
      },
    ],
    priceRange: { currency: 'JPY', minPrice: 1000, maxPrice: 2000 },
  })
  vi.mocked(getRestaurantMenus).mockResolvedValue({
    menus: [menu],
    hasNext: false,
  })
  vi.mocked(getRestaurantReviews).mockResolvedValue({
    restaurantId: 10,
    averageRating: 4.8,
    reviewCount: 2,
    ratingDistribution: { five: 1, four: 1, three: 0, two: 0, one: 0 },
    reviews: [review],
    hasNext: false,
  })
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
  vi.resetAllMocks()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('shows the design spinner while the selected summary is loading, then replaces it with detail', async () => {
  let resolve!: (value: RestaurantSummary) => void
  vi.mocked(getRestaurantSummary).mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done
      }),
  )
  setup()
  const loading = screen.getByRole('status')
  expect(loading).toHaveTextContent('식당 정보를 불러오고 있어요.')
  expect(loading.querySelector('img')).toHaveAttribute('src', spinner)
  expect(
    screen.queryByRole('heading', { name: '목록 식당' }),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: /사진 1 보기/ }),
  ).not.toBeInTheDocument()
  await act(async () => resolve(summary))
  expect(
    await screen.findByRole('heading', { name: '서버 식당' }),
  ).toBeVisible()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('uses the spinner for a pending expanded store-information tab', async () => {
  let resolve!: (
    value: Awaited<ReturnType<typeof getRestaurantStoreInformation>>,
  ) => void
  vi.mocked(getRestaurantStoreInformation).mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done
      }),
  )
  const view = setup()
  await screen.findByRole('heading', { name: '서버 식당' })
  view.update('expanded')
  const loading = within(
    screen.getByRole('tabpanel', { name: '매장 정보' }),
  ).getByRole('status')
  expect(loading).toHaveTextContent('매장 정보를 불러오고 있어요.')
  expect(loading.querySelector('img')).toHaveAttribute('src', spinner)
  await act(async () =>
    resolve({
      restaurantId: 10,
      description: '조회된 매장 설명',
      businessHours: [],
    }),
  )
  expect(await screen.findByText('조회된 매장 설명')).toBeVisible()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('loads the selected summary before lazily loading expanded store information', async () => {
  const view = setup()
  expect(
    await screen.findByRole('heading', { name: '서버 식당' }),
  ).toBeVisible()
  expect(getRestaurantSummary).toHaveBeenCalledWith(10)
  expect(getRestaurantStoreInformation).not.toHaveBeenCalled()
  expect(getRestaurantMenus).not.toHaveBeenCalled()
  expect(getRestaurantReviews).not.toHaveBeenCalled()
  view.update('expanded')
  expect(await screen.findByText('실제 가게 설명')).toBeVisible()
  expect(screen.getByText('11:00 - 20:00')).toBeVisible()
  expect(
    within(screen.getByRole('tabpanel', { name: '매장 정보' })).getByText(
      'JPY 1,000 - 2,000',
    ),
  ).toBeVisible()
  expect(getRestaurantStoreInformation).toHaveBeenCalledWith(10)
})

it('loads menus and reviews only when their tabs are selected, preserving loaded menus on next-page failure', async () => {
  const observer = mockIntersectionObserver()
  vi.mocked(getRestaurantMenus)
    .mockResolvedValueOnce({ menus: [menu], hasNext: true, nextCursor: 1 })
    .mockRejectedValueOnce(new Error('next page failed'))
    .mockResolvedValueOnce({
      menus: [{ ...menu, menuId: 2, name: '치킨 카츠' }],
      hasNext: false,
    })
  const user = userEvent.setup()
  setup('expanded')
  await screen.findByText('실제 가게 설명')
  await user.click(screen.getByRole('tab', { name: '메뉴' }))
  expect(await screen.findByText('특상 돈카츠')).toBeVisible()
  expect(getRestaurantMenus).toHaveBeenCalledWith(
    expect.objectContaining({ restaurantId: 10, cursor: undefined, size: 10 }),
  )
  observer.triggerAllIntersects()
  expect(await screen.findByText('메뉴를 더 불러오지 못했어요.')).toBeVisible()
  expect(screen.getByText('특상 돈카츠')).toBeVisible()
  await user.click(screen.getByRole('button', { name: '메뉴 다시 불러오기' }))
  expect(await screen.findByText('치킨 카츠')).toBeVisible()
  expect(getRestaurantMenus).toHaveBeenLastCalledWith(
    expect.objectContaining({ cursor: 1 }),
  )
  expect(getRestaurantReviews).not.toHaveBeenCalled()
  await user.click(screen.getByRole('tab', { name: /리뷰/ }))
  expect(await screen.findByText('실제 방문자')).toBeVisible()
  expect(screen.getByText('맛있는 식당')).toBeVisible()
})

it('loads the photo API gallery and resets the cursor when changing filters, without using summary photos', async () => {
  const user = userEvent.setup()
  setup('expanded')
  await screen.findByText('실제 가게 설명')
  await user.click(screen.getByRole('tab', { name: /^사진/ }))
  const panel = screen.getByRole('tabpanel', { name: '사진' })
  panel.scrollIntoView = vi.fn()
  const photo = await within(panel).findByRole('button', {
    name: '1번째 사진 보기',
  })
  expect(photo.querySelector('img')).toHaveAttribute('src', '/gallery.jpg')
  expect(
    panel.querySelector('img[src="https://images.test/hero.jpg"]'),
  ).toBeNull()
  vi.mocked(getRestaurantPhotos).mockResolvedValue({
    photos: [],
    counts: { all: 1, representative: 0, menu: 0, review: 1 },
  })
  await user.click(within(panel).getByRole('button', { name: /메뉴사진/ }))
  expect(panel.scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
  expect(await within(panel).findByText('등록된 사진이 없어요.')).toBeVisible()
  expect(getRestaurantPhotos).toHaveBeenLastCalledWith(
    expect.objectContaining({
      restaurantId: 10,
      filter: 'menu',
      cursor: undefined,
    }),
  )
})

it('retries photo failures locally and preserves existing gallery items when a later page fails', async () => {
  const observer = mockIntersectionObserver()
  const user = userEvent.setup()
  vi.mocked(getRestaurantPhotos).mockRejectedValue(
    new Error('initial photo failure'),
  )
  const view = setup('expanded')
  await screen.findByText('실제 가게 설명')
  await user.click(screen.getByRole('tab', { name: /^사진/ }))
  const panel = screen.getByRole('tabpanel', { name: '사진' })
  expect(
    await within(panel).findByText('사진을 불러오지 못했어요.'),
  ).toBeVisible()
  expect(view.onLoadError).not.toHaveBeenCalled()
  const photo = {
    id: 'REVIEW:1',
    imageUrl: '/gallery.jpg',
    thumbnailUrl: '/gallery.jpg',
  }
  const counts = { all: 2, representative: 0, menu: 0, review: 2 }
  vi.mocked(getRestaurantPhotos).mockResolvedValue({
    photos: [photo],
    counts,
    nextCursor: 'next-photo',
  })
  await user.click(within(panel).getByRole('button', { name: '다시 시도' }))
  const firstPhoto = await within(panel).findByRole('button', {
    name: '1번째 사진 보기',
  })
  expect(firstPhoto.style.aspectRatio).toBe('')
  vi.mocked(getRestaurantPhotos).mockRejectedValue(
    new Error('next photo failure'),
  )
  observer.triggerAllIntersects()
  expect(
    await within(panel).findByText('사진을 더 불러오지 못했어요.'),
  ).toBeVisible()
  expect(firstPhoto).toBeVisible()
  vi.mocked(getRestaurantPhotos).mockResolvedValue({
    photos: [{ ...photo, id: 'REVIEW:2' }],
    counts,
  })
  await user.click(within(panel).getByRole('button', { name: '다시 시도' }))
  expect(
    await within(panel).findByRole('button', { name: '2번째 사진 보기' }),
  ).toBeVisible()
  expect(getRestaurantPhotos).toHaveBeenLastCalledWith(
    expect.objectContaining({ filter: 'all', cursor: 'next-photo' }),
  )
  expect(view.onLoadError).not.toHaveBeenCalled()
})

it('opens fetched hero photos in the local viewer and restores focus on close', async () => {
  const user = userEvent.setup()
  const view = setup()
  const photo = await screen.findByRole('button', {
    name: '서버 식당 사진 1 보기',
  })
  await user.click(photo)
  const viewer = screen.getByRole('dialog', { name: '식당 사진 상세보기' })
  expect(viewer.querySelector('img')).toHaveAttribute(
    'src',
    'https://images.test/hero.jpg',
  )
  expect(view.onPhotoSelect).not.toHaveBeenCalled()
  await user.keyboard('{Escape}')
  await waitFor(() => expect(photo).toHaveFocus())
})

it('ignores a previous selection failure but reports the current selection failure once', async () => {
  let rejectPrevious: (reason: Error) => void = () => {}
  vi.mocked(getRestaurantSummary).mockImplementation((id) =>
    id === 10
      ? new Promise((_, reject) => {
          rejectPrevious = reject
        })
      : Promise.resolve({ ...summary, restaurantId: id, name: '새 식당' }),
  )
  const view = setup()
  view.update('normal', { ...restaurant, id: '20' })
  expect(await screen.findByRole('heading', { name: '새 식당' })).toBeVisible()
  await act(async () => rejectPrevious(new Error('old failure')))
  expect(view.onLoadError).not.toHaveBeenCalled()
  vi.mocked(getRestaurantSummary).mockRejectedValueOnce(
    new Error('current failure'),
  )
  view.update('normal', { ...restaurant, id: '30' })
  await waitFor(() => expect(view.onLoadError).toHaveBeenCalledTimes(1))
  view.update('normal', { ...restaurant, id: '30' })
  expect(view.onLoadError).toHaveBeenCalledTimes(1)
})

it('clears pending review sorting when leaving the review tab and ignores its late failure', async () => {
  let rejectSort: (reason: Error) => void = () => {}
  vi.mocked(getRestaurantReviews).mockImplementation(async ({ sort }) => {
    if (sort === 'rating-high')
      return new Promise((_, reject) => {
        rejectSort = reject
      })
    return {
      averageRating: 4.8,
      reviewCount: 2,
      reviews: [review],
      hasNext: false,
    }
  })
  const user = userEvent.setup()
  setup('expanded')
  await screen.findByText('실제 가게 설명')
  await user.click(screen.getByRole('tab', { name: /리뷰/ }))
  await screen.findByText('실제 방문자')
  await user.click(screen.getByRole('button', { name: '높은 평점 순' }))
  await user.click(screen.getByRole('tab', { name: '메뉴' }))
  await screen.findByText('특상 돈카츠')
  await act(async () => rejectSort(new Error('old sort failure')))
  await user.click(screen.getByRole('tab', { name: /리뷰/ }))
  expect(await screen.findByText('실제 방문자')).toBeVisible()
  expect(screen.getByRole('button', { name: '최신순' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

it('resets review reentry to latest and a newly requested first page, instead of retaining cached pages', async () => {
  const observer = mockIntersectionObserver()
  const user = userEvent.setup()
  vi.mocked(getRestaurantReviews).mockImplementation(
    async ({ sort, cursor }) => ({
      averageRating: 5,
      reviewCount: 2,
      hasNext: !cursor,
      nextCursor: cursor ? undefined : 1,
      reviews: [
        {
          ...review,
          reviewId: cursor ? 2 : 1,
          content: cursor ? '이전 두 번째 페이지' : `${sort} 첫 페이지`,
        },
      ],
    }),
  )
  const scroll = vi.fn()
  const view = setup('expanded')
  await screen.findByText('실제 가게 설명')
  await user.click(screen.getByRole('tab', { name: /리뷰/ }))
  await screen.findByText('latest 첫 페이지')
  observer.triggerAllIntersects()
  await screen.findByText('이전 두 번째 페이지')
  await user.click(screen.getByRole('button', { name: '높은 평점 순' }))
  await screen.findByText('rating-high 첫 페이지')
  await user.click(screen.getByRole('tab', { name: '메뉴' }))
  await screen.findByText('특상 돈카츠')
  screen.getByRole('tabpanel').scrollIntoView = scroll
  vi.mocked(getRestaurantReviews).mockClear()
  await user.click(screen.getByRole('tab', { name: /리뷰/ }))
  expect(await screen.findByText('latest 첫 페이지')).toBeVisible()
  expect(screen.getByRole('button', { name: '최신순' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect(screen.queryByText('이전 두 번째 페이지')).not.toBeInTheDocument()
  expect(getRestaurantReviews).toHaveBeenCalledTimes(1)
  expect(getRestaurantReviews).toHaveBeenLastCalledWith(
    expect.objectContaining({ sort: 'latest', cursor: undefined, size: 5 }),
  )
  expect(scroll).toHaveBeenCalledWith({ block: 'start' })
  view.client.clear()
})

it('opens the selected menu instead of the unavailable action', async () => {
  const user = userEvent.setup()
  const view = setup('expanded')
  await screen.findByText('실제 가게 설명')
  await user.click(screen.getByRole('tab', { name: '메뉴' }))
  await user.click(await screen.findByRole('button', { name: /특상 돈카츠/ }))
  expect(view.onPressMenuItem).toHaveBeenCalledWith('1')
  expect(view.onUnavailable).not.toHaveBeenCalled()
})

it('requests only a new first page when returning directly to the review tab', async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
  })
  const cachedPage = {
    averageRating: 5,
    reviewCount: 2,
    hasNext: true,
    nextCursor: 1,
    reviews: [review],
  }
  client.setQueryData(restaurantDetailQueryKeys.reviews(10, 5, 'latest'), {
    pages: [
      cachedPage,
      {
        ...cachedPage,
        reviews: [
          { ...review, reviewId: 2, content: '복원되면 안 되는 다음 페이지' },
        ],
        hasNext: false,
      },
    ],
    pageParams: [undefined, 1],
  })
  render(
    <QueryClientProvider client={client}>
      <MapRestaurantDetail
        restaurant={restaurant}
        stage="expanded"
        initialTab="review"
        onStageChange={vi.fn()}
        onClose={vi.fn()}
        onUnavailable={vi.fn()}
        onPressMenuItem={vi.fn()}
      />
    </QueryClientProvider>,
  )
  await screen.findByText('맛있는 식당')
  await waitFor(() => expect(getRestaurantReviews).toHaveBeenCalledTimes(1))
  expect(getRestaurantReviews).toHaveBeenCalledWith(
    expect.objectContaining({ sort: 'latest', size: 5, cursor: undefined }),
  )
  expect(
    screen.queryByText('복원되면 안 되는 다음 페이지'),
  ).not.toBeInTheDocument()
  client.clear()
})

it('keeps list failures local and retries the selected menu tab', async () => {
  vi.mocked(getRestaurantMenus)
    .mockRejectedValueOnce(new Error('menu failed'))
    .mockResolvedValueOnce({ menus: [], hasNext: false })
  const user = userEvent.setup()
  const view = setup('expanded')
  await screen.findByText('실제 가게 설명')
  await user.click(screen.getByRole('tab', { name: '메뉴' }))
  expect(
    await screen.findByText('메뉴 정보를 불러오지 못했어요.'),
  ).toBeVisible()
  expect(view.onLoadError).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: '메뉴 다시 불러오기' }))
  expect(await screen.findByText('메뉴 리스트를 준비중이에요.')).toBeVisible()
})

it('reports store information failures only after expanding the info tab', async () => {
  vi.mocked(getRestaurantStoreInformation).mockRejectedValueOnce(
    new Error('info failed'),
  )
  const view = setup()
  await screen.findByRole('heading', { name: '서버 식당' })
  expect(view.onLoadError).not.toHaveBeenCalled()
  view.update('expanded')
  await waitFor(() => expect(view.onLoadError).toHaveBeenCalledTimes(1))
})

it('waits for a reselected summary retry instead of closing on its cached refetch error', async () => {
  const view = setup()
  await screen.findByRole('heading', { name: '서버 식당' })
  view.update('normal', { ...restaurant, id: '20' })
  await waitFor(() => expect(getRestaurantSummary).toHaveBeenCalledWith(20))
  vi.mocked(getRestaurantSummary).mockRejectedValueOnce(
    new Error('past failure'),
  )
  await expect(
    view.client.fetchQuery({
      ...restaurantSummaryQueryOptions(10),
      staleTime: 0,
    }),
  ).rejects.toThrow('past failure')
  let resolveRetry!: (value: RestaurantSummary) => void
  vi.mocked(getRestaurantSummary).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveRetry = resolve
      }),
  )
  view.update('normal')
  await waitFor(() => expect(getRestaurantSummary).toHaveBeenCalledTimes(4))
  expect(view.onLoadError).not.toHaveBeenCalled()
  await act(async () => resolveRetry({ ...summary, name: '복구된 식당' }))
  expect(
    await screen.findByRole('heading', { name: '복구된 식당' }),
  ).toBeVisible()
  expect(view.onLoadError).not.toHaveBeenCalled()
})

it('waits for a cached store-information retry and reports only the new failure', async () => {
  const view = setup('expanded')
  await screen.findByText('실제 가게 설명')
  view.update('normal', { ...restaurant, id: '20' })
  await waitFor(() => expect(getRestaurantSummary).toHaveBeenCalledWith(20))
  vi.mocked(getRestaurantStoreInformation).mockRejectedValueOnce(
    new Error('past failure'),
  )
  await expect(
    view.client.fetchQuery({
      ...restaurantStoreInformationQueryOptions(10),
      staleTime: 0,
    }),
  ).rejects.toThrow('past failure')
  let rejectRetry!: (error: Error) => void
  vi.mocked(getRestaurantStoreInformation).mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        rejectRetry = reject
      }),
  )
  view.update('expanded')
  await waitFor(() =>
    expect(getRestaurantStoreInformation).toHaveBeenCalledTimes(3),
  )
  expect(view.onLoadError).not.toHaveBeenCalled()
  await act(async () => rejectRetry(new Error('new failure')))
  await waitFor(() => expect(view.onLoadError).toHaveBeenCalledTimes(1))
})

it('limits fetched summary hero photos to ten and uses independent gallery counts', async () => {
  vi.mocked(getRestaurantSummary).mockResolvedValueOnce({
    ...summary,
    imageUrls: Array.from(
      { length: 12 },
      (_, index) => `https://images.test/hero-${index}.jpg`,
    ),
  })
  setup('expanded')
  await screen.findByText('실제 가게 설명')
  expect(
    screen.getAllByRole('button', { name: /서버 식당 사진 \d+ 보기/ }),
  ).toHaveLength(10)
  expect(screen.getByRole('tab', { name: '사진 1' })).toBeVisible()
})

it('opens review images above expanded detail and restores the review thumbnail without collapsing', async () => {
  vi.mocked(getRestaurantReviews).mockResolvedValueOnce({
    averageRating: 5,
    reviewCount: 1,
    reviews: [
      { ...review, previewImageUrls: ['https://images.test/review.jpg'] },
    ],
    hasNext: false,
  })
  const user = userEvent.setup()
  const view = setup('expanded')
  await screen.findByText('실제 가게 설명')
  await user.click(screen.getByRole('tab', { name: /리뷰/ }))
  const photo = await screen.findByRole('button', { name: '리뷰 이미지 1' })
  await user.click(photo)
  expect(
    screen
      .getByRole('dialog', { name: '식당 사진 상세보기' })
      .querySelector('img'),
  ).toHaveAttribute('src', 'https://images.test/review.jpg')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(photo).toHaveFocus())
  expect(view.onStageChange).not.toHaveBeenCalled()
  expect(
    screen.getByRole('dialog', { name: '서버 식당 전체 상세' }),
  ).toBeVisible()
})
