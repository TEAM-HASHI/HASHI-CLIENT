import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HttpStatusError } from '@/shared/api/apiError'
import { checkShouldThrowQueryError } from '@/shared/api/errorPolicy'

import { MagazinesPage } from '@/pages/magazines/MagazinesPage'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'

const { mockGetMagazineBanners, mockGetMagazines } = vi.hoisted(() => ({
  mockGetMagazineBanners: vi.fn(),
  mockGetMagazines: vi.fn(),
}))

vi.mock('@/features/magazine/api/getMagazineBanners', () => ({
  getMagazineBanners: mockGetMagazineBanners,
}))

vi.mock('@/pages/magazines/api/getMagazines', () => ({
  getMagazines: mockGetMagazines,
}))

const magazineBannersResponse = {
  banners: [
    {
      magazineId: 1,
      title: '하시가 추천하는 도쿄 미식 매거진 1',
      bannerImageUrl: 'https://example.com/banner-1.jpg',
    },
    {
      magazineId: 2,
      title: '하시가 추천하는 도쿄 미식 매거진 2',
      bannerImageUrl: 'https://example.com/banner-2.jpg',
    },
  ],
}

const magazinesResponse = {
  hasNext: false,
  magazines: [
    {
      magazineId: 101,
      title:
        '[청와대 셰프가 추천하는 도쿄 스시 맛집 8선] 제목은 여기까지 좌랄랄랄라라라 넘으면...',
      thumbnailImageUrl: 'https://example.com/magazine-101.jpg',
      createdAt: '2026-07-12T00:00:00.000Z',
    },
    {
      magazineId: 102,
      title: '청와대 셰프가 추천하는 도쿄 스시 맛집 8선입니다.',
      thumbnailImageUrl: 'https://example.com/magazine-102.jpg',
      createdAt: '2026-07-11T00:00:00.000Z',
    },
  ],
}

const renderMagazinesPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        throwOnError: checkShouldThrowQueryError,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <MagazinesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MagazinesPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    sessionStorage.clear()
    mockGetMagazineBanners.mockResolvedValue(magazineBannersResponse)
    mockGetMagazines.mockResolvedValue(magazinesResponse)
  })

  it('reloads expired pages before restoring the history entry scroll position', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    sessionStorage.setItem(
      'magazine-list:default',
      JSON.stringify({ pageCount: 3, scrollY: 1800 }),
    )
    mockGetMagazines.mockImplementation(({ cursor }) =>
      Promise.resolve({
        hasNext: cursor !== 20,
        nextCursor: cursor === undefined ? 10 : 20,
        magazines: [
          {
            ...magazinesResponse.magazines[0],
            magazineId: cursor ?? 0,
            title: `페이지 ${cursor ?? 0}`,
          },
        ],
      }),
    )
    renderMagazinesPage()
    await waitFor(() =>
      expect(scrollTo).toHaveBeenCalledWith({ top: 1800, behavior: 'auto' }),
    )
    expect(
      mockGetMagazines.mock.calls.map(([params]) => params.cursor),
    ).toEqual([undefined, 10, 20])
    expect(
      screen.getByRole('heading', { name: '페이지 20' }),
    ).toBeInTheDocument()
  })

  it('pauses restoration after a failed page and resumes through explicit retry', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    sessionStorage.setItem(
      'magazine-list:default',
      JSON.stringify({ pageCount: 2, scrollY: 1800 }),
    )
    mockGetMagazines
      .mockResolvedValueOnce({
        ...magazinesResponse,
        hasNext: true,
        nextCursor: 10,
      })
      .mockRejectedValueOnce(new Error('restoration failed'))
      .mockResolvedValueOnce({
        hasNext: false,
        magazines: [
          {
            ...magazinesResponse.magazines[0],
            magazineId: 103,
            title: '복원된 다음 페이지',
          },
        ],
      })
    renderMagazinesPage()
    const retry = await screen.findByRole('button', { name: '다시 시도' })
    expect(mockGetMagazines).toHaveBeenCalledTimes(2)
    expect(scrollTo).not.toHaveBeenCalled()
    expect(
      JSON.parse(sessionStorage.getItem('magazine-list:default')!),
    ).toEqual({ pageCount: 2, scrollY: 1800 })
    fireEvent.click(retry)
    await waitFor(() =>
      expect(scrollTo).toHaveBeenCalledWith({ top: 1800, behavior: 'auto' }),
    )
    expect(mockGetMagazines).toHaveBeenLastCalledWith({ cursor: 10, size: 10 })
  })

  it('hides a failed banner without blocking the magazine list', async () => {
    mockGetMagazineBanners.mockRejectedValueOnce(new Error('banner failed'))

    renderMagazinesPage()

    expect(
      await screen.findByRole('heading', {
        name: /\[청와대 셰프가 추천하는 도쿄 스시 맛집 8선\]/,
      }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(
        screen.queryByRole('region', { name: '대표 매거진 배너' }),
      ).not.toBeInTheDocument()
    })
  })

  it('retries a failed initial magazine request in the list area', async () => {
    mockGetMagazines
      .mockRejectedValueOnce(new HttpStatusError(500))
      .mockResolvedValueOnce(magazinesResponse)

    renderMagazinesPage()

    fireEvent.click(await screen.findByRole('button', { name: '다시 시도' }))

    await screen.findByRole('heading', {
      name: /\[청와대 셰프가 추천하는 도쿄 스시 맛집 8선\]/,
    })
    expect(mockGetMagazines).toHaveBeenCalledTimes(2)
  })

  it('keeps the load-more sentinel when the current page has only filtered-out items and another page remains', async () => {
    mockGetMagazines
      .mockResolvedValueOnce({
        hasNext: true,
        nextCursor: 200,
        magazines: [
          {
            magazineId: 201,
            title: '',
            thumbnailImageUrl: 'https://example.com/magazine-201.jpg',
            createdAt: '2026-07-10T00:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({
        hasNext: false,
        magazines: [
          {
            magazineId: 202,
            title: '다음 페이지에서 찾은 추천 매거진',
            thumbnailImageUrl: 'https://example.com/magazine-202.jpg',
            createdAt: '2026-07-09T00:00:00.000Z',
          },
        ],
      })

    renderMagazinesPage()

    await screen.findByRole('heading', {
      name: '다음 페이지에서 찾은 추천 매거진',
    })
    await waitFor(() => {
      expect(mockGetMagazines).toHaveBeenLastCalledWith({
        cursor: 200,
        size: 10,
      })
    })
  })

  it('does not request the same next magazine page twice when the sentinel intersects repeatedly in one render cycle', async () => {
    const { IntersectionObserverMock, triggerAllIntersects } =
      mockIntersectionObserver()

    mockGetMagazines
      .mockResolvedValueOnce({
        hasNext: true,
        nextCursor: 300,
        magazines: [
          {
            magazineId: 301,
            title: '첫 페이지 추천 매거진',
            thumbnailImageUrl: 'https://example.com/magazine-301.jpg',
            createdAt: '2026-07-10T00:00:00.000Z',
          },
        ],
      })
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            window.setTimeout(() => {
              resolve({
                hasNext: false,
                magazines: [
                  {
                    magazineId: 302,
                    title: '다음 페이지 추천 매거진',
                    thumbnailImageUrl: 'https://example.com/magazine-302.jpg',
                    createdAt: '2026-07-09T00:00:00.000Z',
                  },
                ],
              })
            }, 10)
          }),
      )

    renderMagazinesPage()

    await screen.findByRole('heading', { name: '첫 페이지 추천 매거진' })
    await waitFor(() => {
      expect(IntersectionObserverMock).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(mockGetMagazines).toHaveBeenCalledTimes(1)
    })

    triggerAllIntersects()
    triggerAllIntersects()

    await waitFor(() => {
      expect(mockGetMagazines).toHaveBeenCalledTimes(2)
    })
    expect(mockGetMagazines).toHaveBeenNthCalledWith(2, {
      cursor: 300,
      size: 10,
    })
  })

  it('keeps loaded cards and retries only the failed next page', async () => {
    const { triggerAllIntersects } = mockIntersectionObserver()
    mockGetMagazines
      .mockResolvedValueOnce({
        hasNext: true,
        nextCursor: 300,
        magazines: [magazinesResponse.magazines[0]],
      })
      .mockRejectedValueOnce(new Error('next page failed'))
      .mockResolvedValueOnce({
        hasNext: false,
        magazines: [magazinesResponse.magazines[1]],
      })

    renderMagazinesPage()

    await screen.findByRole('heading', {
      name: /\[청와대 셰프가 추천하는 도쿄 스시 맛집 8선\]/,
    })
    triggerAllIntersects()

    const retryButton = await screen.findByRole('button', {
      name: '다시 시도',
    })
    expect(
      screen.getByRole('heading', {
        name: /\[청와대 셰프가 추천하는 도쿄 스시 맛집 8선\]/,
      }),
    ).toBeInTheDocument()

    fireEvent.click(retryButton)

    await screen.findByRole('heading', {
      name: '청와대 셰프가 추천하는 도쿄 스시 맛집 8선입니다.',
    })
    expect(mockGetMagazines).toHaveBeenNthCalledWith(3, {
      cursor: 300,
      size: 10,
    })
  })
})
