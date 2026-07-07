import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'

import { MagazinesPage } from '@/pages/magazines/MagazinesPage'
import { normalizeInstagramUrl } from '@/pages/magazines/hooks/useMagazinesPage'

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('MagazinesPage', () => {
  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
  })

  it('renders magazine banner and recommended magazine list without category filters', () => {
    render(<MagazinesPage />)

    expect(screen.getByRole('banner')).toHaveTextContent('매거진')
    const heroBanner = screen.getByRole('region', { name: '대표 매거진 배너' })
    const sectionTitle = screen.getByRole('heading', {
      name: '최근 _한 추천 매거진',
    })

    expect(heroBanner).toBeInTheDocument()
    expect(
      heroBanner.querySelector('[data-hds-carousel-indicator]'),
    ).toHaveAttribute('data-align', 'end')
    expect(screen.queryByText('오늘의 하시 Pick')).not.toBeInTheDocument()
    expect(
      screen.queryByText('짧은 매거진에 대한 소개를 넣어보기'),
    ).not.toBeInTheDocument()
    expect(sectionTitle).toHaveClass('typo-header-3', 'text-black')
    expect(
      screen.getByRole('heading', { name: '최근 _한 추천 매거진' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(screen.queryByText(/부드러운 돈카츠/)).not.toBeInTheDocument()

    expect(screen.queryByText('인기순')).not.toBeInTheDocument()
    expect(screen.queryByText('지역별')).not.toBeInTheDocument()
    expect(screen.queryByText('시리즈별')).not.toBeInTheDocument()
    expect(screen.queryByText('장르별')).not.toBeInTheDocument()
  })

  it('renders hero banners in display order with meaningful accessible names', () => {
    render(<MagazinesPage />)

    const heroLinks = screen.getAllByRole('link', {
      name: /하시가 추천하는 도쿄 미식 매거진/,
    })

    expect(heroLinks).toHaveLength(5)
    expect(heroLinks[0]).toHaveAccessibleName(
      '하시가 추천하는 도쿄 미식 매거진 1',
    )
    expect(heroLinks[1]).toHaveAccessibleName(
      '하시가 추천하는 도쿄 미식 매거진 2',
    )
  })

  it('moves to home from header back action', () => {
    render(<MagazinesPage />)

    fireEvent.click(screen.getByRole('button', { name: '홈으로 돌아가기' }))

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.home)
  })

  it('renders semantic external links for banner and magazine cards', () => {
    render(<MagazinesPage />)

    expect(
      screen.getByRole('link', {
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

  it('applies requested magazine layout token classes', () => {
    render(<MagazinesPage />)

    const heroBanner = screen.getByRole('region', { name: '대표 매거진 배너' })
    const heroViewport = heroBanner.querySelector(
      '[data-hds-carousel-viewport]',
    )
    const indicator = heroBanner.querySelector('[data-hds-carousel-indicator]')
    const sectionTitle = screen.getByRole('heading', {
      name: '최근 _한 추천 매거진',
    })
    const firstItem = screen.getAllByRole('listitem')[0]
    const firstLink = screen.getByRole('link', {
      name: /\[청와대 셰프가 추천하는 도쿄 스시 맛집 8선\]/,
    })
    const firstTitle = screen.getByRole('heading', {
      name: /\[청와대 셰프가 추천하는 도쿄 스시 맛집 8선\]/,
    })
    const firstImage = firstLink.querySelector('img')
    const firstDate = screen.getAllByText('2000. 00. 00.')[0]

    expect(heroViewport).toHaveClass('h-[260px]')
    expect(indicator).toHaveAttribute('data-align', 'end')
    expect(sectionTitle.parentElement).toHaveClass('px-5', 'pt-7', 'pb-3')
    expect(firstItem).toHaveClass('border-warm-gray-50')
    expect(firstLink).toHaveClass('py-3.5')
    expect(firstTitle).toHaveClass('typo-body-6', 'text-black')
    expect(firstImage).toHaveAttribute('alt', '')
    expect(firstImage).toHaveClass('h-[108px]', 'w-[164px]', 'rounded-[5px]')
    expect(firstDate).toHaveClass(
      'typo-caption-1',
      'font-medium',
      'text-warm-gray-300',
    )
  })
})
