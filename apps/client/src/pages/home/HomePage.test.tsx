import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'

import { HomePage } from './HomePage'

const LocationProbe = () => {
  const location = useLocation()

  return <div data-testid="location-pathname">{location.pathname}</div>
}

const renderHomePage = () => {
  return render(
    <MemoryRouter initialEntries={[ROUTES.home]}>
      <HomePage />
      <LocationProbe />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the home landing content and primary navigation links', () => {
    renderHomePage()

    const logo = screen.getByRole('img', { name: 'Hashi' })
    expect(logo).toHaveAttribute('height', '23')
    expect(logo).toHaveAttribute('width', '73')
    expect(logo.getAttribute('src')).toBeTruthy()
    expect(
      screen.getByRole('searchbox', { name: '식당 또는 메뉴 검색하기' }),
    ).toHaveAttribute('readonly')
    expect(
      screen.getByRole('region', { name: '맛집 큐레이션 배너' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '도쿄 미식 큐레이션 배너' }),
    ).toHaveAttribute('href', 'https://www.instagram.com/hashi_tokyo_curation/')
    expect(
      screen.getByRole('link', { name: '도쿄 미식 큐레이션 배너' }),
    ).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: '하시 PICK' })).toHaveAttribute(
      'href',
      ROUTES.hashiPickRestaurants,
    )
    expect(screen.getByRole('link', { name: '인기 맛집' })).toHaveAttribute(
      'href',
      ROUTES.popularRestaurants,
    )
    expect(screen.getByRole('link', { name: '매거진' })).toHaveAttribute(
      'href',
      ROUTES.magazines,
    )
    expect(screen.getByRole('link', { name: '오늘의 식당' })).toHaveAttribute(
      'href',
      ROUTES.todayRestaurant,
    )
  })

  it('moves to anywhere reservation only when the CTA button is clicked', () => {
    renderHomePage()

    fireEvent.click(screen.getByRole('button', { name: '예약하기' }))

    expect(screen.getByTestId('location-pathname')).toHaveTextContent(
      ROUTES.anywhereReservation,
    )
  })

  it('moves to search page when the SearchField is clicked', () => {
    renderHomePage()

    const searchbox = screen.getByRole('searchbox', {
      name: '식당 또는 메뉴 검색하기',
    })
    const searchFieldContainer = searchbox.parentElement

    expect(searchFieldContainer).not.toBeNull()

    fireEvent.click(searchFieldContainer as HTMLElement)

    expect(screen.getByTestId('location-pathname')).toHaveTextContent(
      ROUTES.search,
    )
  })

  it('links SNS hot restaurants to restaurant detail pages', () => {
    renderHomePage()

    expect(
      screen.getByRole('link', { name: /돈카츠 후쿠마루 도쿄역 야에스점/ }),
    ).toHaveAttribute('href', '/restaurants/tonkatsu-fukumaru-yaesu')
    expect(
      screen.getByRole('link', { name: /숯불 규카츠 미야비 긴자 본점/ }),
    ).toHaveAttribute('href', '/restaurants/gyukatsu-miyabi-ginza')
  })
})
