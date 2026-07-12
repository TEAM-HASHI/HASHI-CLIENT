import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'

import { MagazinesPage } from '@/pages/magazines/MagazinesPage'
import { normalizeInstagramUrl } from '@/pages/magazines/hooks/useMagazinesPage'

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
      bannerImageUrl: 'https://example.com/magazine-101.jpg',
      instagramRedirectUrl: 'https://www.instagram.com/hashi.magazine/101',
      createdAt: '2026-07-12T00:00:00.000Z',
    },
    {
      magazineId: 102,
      title: '청와대 셰프가 추천하는 도쿄 스시 맛집 8선입니다.',
      bannerImageUrl: 'https://example.com/magazine-102.jpg',
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
    expect(recommendedSection).toHaveClass('pt-5')
    expect(firstItem).toHaveClass('border-warm-gray-50')
    expect(magazineList).toHaveClass('gap-5', 'px-5')
    expect(firstLink).toHaveClass('gap-[21px]', 'pt-5', 'pb-2')
    expect(firstTitle).toHaveClass('typo-body-6', 'text-black')
    expect(firstImage).toHaveAttribute('alt', '')
    expect(firstImage).toHaveClass(
      'aspect-[353/160]',
      'w-[164px]',
      'rounded-[5px]',
    )
    expect(firstDate).toHaveClass(
      'typo-caption-1',
      'font-medium',
      'text-warm-gray-300',
    )
  })
})
