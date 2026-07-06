import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import { HashiPickPage } from '@/pages/hashiPick'

import { RestaurantListPage } from './RestaurantListPage'
import type { FilterOption, Restaurant } from './types'

const sortOptions: FilterOption[] = [
  { label: '기본순', value: 'default' },
  { label: '인기순', value: 'popular' },
  { label: '별점순', value: 'rating' },
]

const restaurants: Restaurant[] = [
  {
    id: 'restaurant-1',
    name: '히마와리 스시 신도심점',
    rating: 4.8,
    region: '도쿄',
    category: '초밥',
    images: [
      '/images/mock/restaurant-1.png',
      '/images/mock/restaurant-2.png',
      '/images/mock/restaurant-3.png',
    ],
    description: '식당 소개를 여기 간단하게 한 줄 적어주세요.',
    hashtags: ['#스시', '#예약가능', '#현지인추천'],
  },
]

const LocationPath = () => {
  const location = useLocation()

  return <div data-testid="location-path">{location.pathname}</div>
}

const renderWithRouter = (ui: ReactNode) => {
  return render(
    <MemoryRouter initialEntries={['/restaurants/hashi-pick']}>
      <Routes>
        <Route element={ui} path="/restaurants/hashi-pick" />
        <Route element={<LocationPath />} path="/restaurants/:restaurantId" />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RestaurantListPage', () => {
  afterEach(() => {
    cleanup()
    document.body.style.overflow = ''
  })

  it('renders title, filters, and restaurant cards', () => {
    renderWithRouter(
      <RestaurantListPage
        restaurants={restaurants}
        sortOptions={sortOptions}
        title="하시 Pick"
      />,
    )

    expect(
      screen.getByRole('heading', { name: '하시 Pick' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '정렬 필터: 기본순' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '음식 장르 필터: 음식 장르 선택' }),
    ).toBeInTheDocument()
    expect(screen.getByText('히마와리 스시 신도심점')).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(3)
  })

  it('keeps selected sort unchanged until apply is pressed', () => {
    renderWithRouter(
      <RestaurantListPage
        restaurants={restaurants}
        sortOptions={sortOptions}
        title="하시 Pick"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 기본순' }))
    fireEvent.click(screen.getByRole('button', { name: '인기순' }))
    fireEvent.click(screen.getByRole('button', { name: '닫기' }))

    expect(
      screen.getByRole('button', { name: '정렬 필터: 기본순' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '정렬 필터: 인기순' }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 기본순' }))
    fireEvent.click(screen.getByRole('button', { name: '별점순' }))
    fireEvent.click(screen.getByRole('button', { name: '적용' }))

    expect(
      screen.getByRole('button', { name: '정렬 필터: 별점순' }),
    ).toBeInTheDocument()
  })

  it('resets category draft without applying until the apply button is pressed', () => {
    renderWithRouter(
      <RestaurantListPage
        restaurants={restaurants}
        sortOptions={sortOptions}
        title="하시 Pick"
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: '음식 장르 필터: 음식 장르 선택' }),
    )
    fireEvent.click(screen.getByRole('button', { name: '면류' }))
    fireEvent.click(screen.getByRole('button', { name: '초기화' }))
    fireEvent.click(screen.getByRole('button', { name: '적용' }))

    expect(
      screen.getByRole('button', {
        name: '음식 장르 필터: 음식 장르 선택',
      }),
    ).toBeInTheDocument()
  })

  it('navigates to restaurant detail when a card is pressed', () => {
    renderWithRouter(
      <RestaurantListPage
        restaurants={restaurants}
        sortOptions={sortOptions}
        title="하시 Pick"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /히마와리 스시/ }))

    expect(screen.getByTestId('location-path')).toHaveTextContent(
      '/restaurants/restaurant-1',
    )
  })

  it('navigates to restaurant detail when an image is pressed', () => {
    renderWithRouter(
      <RestaurantListPage
        restaurants={restaurants}
        sortOptions={sortOptions}
        title="하시 Pick"
      />,
    )

    fireEvent.click(
      screen.getByRole('img', { name: '히마와리 스시 신도심점 사진 1' }),
    )

    expect(screen.getByTestId('location-path')).toHaveTextContent(
      '/restaurants/restaurant-1',
    )
  })

  it('renders fallback image slots when restaurant images are missing', () => {
    renderWithRouter(
      <RestaurantListPage
        restaurants={[{ ...restaurants[0], images: [] }]}
        sortOptions={sortOptions}
        title="하시 Pick"
      />,
    )

    expect(screen.queryAllByRole('img')).toHaveLength(0)
    expect(screen.getByTestId('restaurant-image-list')).toHaveClass(
      'overflow-x-auto',
      'max-w-[353px]',
    )
    expect(screen.getAllByTestId('restaurant-image-placeholder')).toHaveLength(
      3,
    )
  })
})

describe('Restaurant list route pages', () => {
  afterEach(() => {
    cleanup()
    document.body.style.overflow = ''
  })

  it('renders HashiPickPage with hashi pick sort options', () => {
    render(
      <MemoryRouter>
        <HashiPickPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 기본순' }))

    expect(
      screen.getByRole('heading', { name: '하시 Pick' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '인기순' })).toBeInTheDocument()
  })
})
