import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'

import { MagazinesPage } from '@/pages/magazines/MagazinesPage'
import { normalizeInstagramUrl } from '@/pages/magazines/hooks/useMagazinesPage'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}))

const { mockGetMagazineBanners, mockGetMagazines } = vi.hoisted(() => ({
  mockGetMagazineBanners: vi.fn(),
  mockGetMagazines: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

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
      instagramRedirectUrl: 'https://www.instagram.com/hashi.magazine/1',
    },
    {
      magazineId: 2,
      title: '하시가 추천하는 도쿄 미식 매거진 2',
      bannerImageUrl: 'https://example.com/banner-2.jpg',
      instagramRedirectUrl: 'https://www.instagram.com/hashi.magazine/2',
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
      instagramRedirectUrl: 'https://www.instagram.com/hashi.magazine/101',
      createdAt: '2026-07-12T00:00:00.000Z',
    },
    {
      magazineId: 102,
      title: '청와대 셰프가 추천하는 도쿄 스시 맛집 8선입니다.',
      thumbnailImageUrl: 'https://example.com/magazine-102.jpg',
      instagramRedirectUrl: 'https://www.instagram.com/hashi.magazine/102',
      createdAt: '2026-07-11T00:00:00.000Z',
    },
  ],
}

const renderMagazinesPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        throwOnError: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MagazinesPage />
    </QueryClientProvider>,
  )
}

describe('MagazinesPage', () => {
  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
    vi.clearAllMocks()
  })

  beforeEach(() => {
    mockGetMagazineBanners.mockResolvedValue(magazineBannersResponse)
    mockGetMagazines.mockResolvedValue(magazinesResponse)
  })

  it('renders magazine banner and recommended magazine list without category filters', async () => {
    renderMagazinesPage()

    expect(screen.getByRole('banner')).toHaveTextContent('매거진')
    const heroBanner = await screen.findByRole('region', {
      name: '대표 매거진 배너',
    })

    expect(heroBanner).toBeInTheDocument()
    expect(screen.getByRole('banner')).toHaveClass(
      'fixed',
      'top-0',
      'right-0',
      'left-0',
      'z-20',
      'mx-auto',
      'w-full',
      'max-w-[var(--app-mobile-max-width)]',
      'bg-white',
    )
    expect(heroBanner.closest('main')).toHaveClass('pt-[75px]')
    expect(
      heroBanner.querySelector('[data-hds-carousel-indicator]'),
    ).toHaveAttribute('data-align', 'end')
    expect(screen.queryByText('오늘의 하시 Pick')).not.toBeInTheDocument()
    expect(
      screen.queryByText('짧은 매거진에 대한 소개를 넣어보기'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: '최근 _한 추천 매거진' }),
    ).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.queryByText(/부드러운 돈카츠/)).not.toBeInTheDocument()

    expect(screen.queryByText('인기순')).not.toBeInTheDocument()
    expect(screen.queryByText('지역별')).not.toBeInTheDocument()
    expect(screen.queryByText('시리즈별')).not.toBeInTheDocument()
    expect(screen.queryByText('장르별')).not.toBeInTheDocument()
  })

  it('renders hero banners in API response order with meaningful accessible names', async () => {
    renderMagazinesPage()

    const heroLinks = await screen.findAllByRole('link', {
      name: /하시가 추천하는 도쿄 미식 매거진/,
    })

    expect(heroLinks).toHaveLength(2)
    expect(heroLinks[0]).toHaveAccessibleName(
      '하시가 추천하는 도쿄 미식 매거진 1',
    )
    expect(heroLinks[1]).toHaveAccessibleName(
      '하시가 추천하는 도쿄 미식 매거진 2',
    )
  })

  it('moves to home from header back action', () => {
    renderMagazinesPage()

    fireEvent.click(screen.getByRole('button', { name: '홈으로 돌아가기' }))

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.home)
  })

  it('renders semantic external links for banner and magazine cards', async () => {
    renderMagazinesPage()

    expect(
      await screen.findByRole('link', {
        name: '하시가 추천하는 도쿄 미식 매거진 1',
      }),
    ).toHaveAttribute('href', 'https://www.instagram.com/hashi.magazine/1')
    expect(
      screen.getByRole('link', {
        name: /\[청와대 셰프가 추천하는 도쿄 스시 맛집 8선\]/,
      }),
    ).toHaveAttribute('href', 'https://www.instagram.com/hashi.magazine/101')
  })

  it('normalizes only valid instagram urls for external navigation', () => {
    expect(
      normalizeInstagramUrl('https://www.instagram.com/hashi.magazine/1'),
    ).toBe('https://www.instagram.com/hashi.magazine/1')
    expect(normalizeInstagramUrl('')).toBeNull()
    expect(normalizeInstagramUrl('not-a-url')).toBeNull()
    expect(normalizeInstagramUrl('javascript:alert(1)')).toBeNull()
    expect(
      normalizeInstagramUrl('https://example.com/hashi.magazine/1'),
    ).toBeNull()
  })

  it('applies requested magazine layout token classes', async () => {
    renderMagazinesPage()

    const heroBanner = await screen.findByRole('region', {
      name: '대표 매거진 배너',
    })
    const heroViewport = heroBanner.querySelector(
      '[data-hds-carousel-viewport]',
    )
    const indicator = heroBanner.querySelector('[data-hds-carousel-indicator]')
    const recommendedSection = screen.getByRole('region', {
      name: '추천 매거진 목록',
    })
    const magazineList = within(recommendedSection).getByRole('list')
    const firstItem = screen.getAllByRole('listitem')[0]
    const firstLink = screen.getByRole('link', {
      name: /\[청와대 셰프가 추천하는 도쿄 스시 맛집 8선\]/,
    })
    const firstTitle = screen.getByRole('heading', {
      name: /\[청와대 셰프가 추천하는 도쿄 스시 맛집 8선\]/,
    })
    const firstImage = firstLink.querySelector('img')
    const firstDate = screen.getByText('2026. 07.12.')

    expect(heroBanner).toHaveClass('mt-[4px]', 'px-5')
    expect(heroViewport).toHaveClass('aspect-[353/160]')
    expect(indicator).toHaveAttribute('data-align', 'end')
    expect(indicator).toHaveClass('!right-[33px]')
    expect(
      screen.queryByRole('heading', { name: '최근 _한 추천 매거진' }),
    ).not.toBeInTheDocument()
    expect(recommendedSection).toHaveClass('pt-4')
    expect(firstItem).toHaveClass('border-warm-gray-50')
    expect(magazineList).toHaveClass('px-5')
    expect(magazineList).not.toHaveClass('gap-5')
    expect(firstLink).toHaveClass('gap-[21px]', 'pt-4', 'pb-2')
    expect(firstTitle).toHaveClass('typo-body-6', 'text-black')
    expect(firstImage).toHaveAttribute('alt', '')
    expect(firstImage).toHaveClass(
      'aspect-[156/88]',
      'w-[156px]',
      'rounded-[5px]',
    )
    expect(firstDate).toHaveClass(
      'typo-caption-1',
      'font-medium',
      'text-warm-gray-300',
    )
  })

  it('uses the shared restaurant list skeleton color for magazine loading placeholders', () => {
    mockGetMagazineBanners.mockImplementation(
      () =>
        new Promise(() => {
          // Keep the banner query pending so the hero skeleton remains visible.
        }),
    )
    mockGetMagazines.mockImplementation(
      () =>
        new Promise(() => {
          // Keep the list query pending so the skeleton remains visible.
        }),
    )

    renderMagazinesPage()

    expect(
      screen.getByRole('region', { name: '대표 매거진 배너 로딩 중' }),
    ).toHaveClass('bg-secondary-200')
    const recommendedSection = screen.getByRole('region', {
      name: '추천 매거진 목록',
    })
    const firstSkeletonItem = within(recommendedSection).getAllByRole(
      'listitem',
      {
        hidden: true,
      },
    )[0]
    const firstSkeletonImage = firstSkeletonItem.querySelector(
      '.aspect-\\[156\\/88\\]',
    )

    expect(firstSkeletonItem.querySelector('.bg-secondary-200')).toBeTruthy()
    expect(firstSkeletonItem.querySelector('.bg-cool-gray-100')).toBeNull()
    expect(firstSkeletonItem).toHaveClass('grid-cols-[1fr_156px]', 'pt-4')
    expect(firstSkeletonImage).toHaveClass('w-[156px]')
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
            instagramRedirectUrl:
              'https://www.instagram.com/hashi.magazine/201',
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
            instagramRedirectUrl:
              'https://www.instagram.com/hashi.magazine/202',
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
            instagramRedirectUrl:
              'https://www.instagram.com/hashi.magazine/301',
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
                    instagramRedirectUrl:
                      'https://www.instagram.com/hashi.magazine/302',
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
})
