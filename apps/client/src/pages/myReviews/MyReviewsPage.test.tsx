import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { MyReviewsPage } from '@/pages/myReviews/MyReviewsPage'

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

describe('MyReviewsPage', () => {
  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
  })

  it('renders writable review tab as the initial tab', () => {
    render(<MyReviewsPage />)

    expect(screen.getByText('마이 리뷰')).toBeTruthy()
    expect(screen.getByRole('tab', { name: '리뷰 쓰기 2' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      screen.getByText((_, element) => element?.textContent === '총 2건'),
    ).toBeTruthy()
    expect(screen.getAllByRole('button', { name: '리뷰 작성' })).toHaveLength(2)
  })

  it('navigates to review new page from writable review card', () => {
    render(<MyReviewsPage />)

    fireEvent.click(screen.getAllByRole('button', { name: '리뷰 작성' })[0])

    expect(mockNavigate).toHaveBeenCalledWith('/restaurants/1/reviews/new')
  })

  it('renders written review list after tab change and opens review menu', () => {
    render(<MyReviewsPage />)

    fireEvent.click(screen.getByRole('tab', { name: '작성한 리뷰 4' }))
    fireEvent.click(screen.getAllByLabelText(/리뷰 메뉴 열기/)[0])

    expect(screen.getByRole('tab', { name: '작성한 리뷰 4' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getAllByRole('img', { name: '평점 5점' })).toHaveLength(4)
    expect(screen.getByRole('menu')).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: '수정하기' })).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: '삭제하기' })).toBeTruthy()
  })

  it('keeps only one written review menu open and closes it on outside click or escape', () => {
    render(<MyReviewsPage />)

    fireEvent.click(screen.getByRole('tab', { name: '작성한 리뷰 4' }))

    const menuButtons = screen.getAllByLabelText(/리뷰 메뉴 열기/)

    fireEvent.click(menuButtons[0])
    expect(screen.getByRole('menuitem', { name: '수정하기' })).toBeTruthy()

    fireEvent.click(menuButtons[1])
    expect(screen.getAllByRole('menuitem', { name: '수정하기' })).toHaveLength(
      1,
    )

    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('menuitem', { name: '수정하기' })).toBeNull()

    fireEvent.click(menuButtons[1])
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menuitem', { name: '수정하기' })).toBeNull()
  })

  it('closes the written review menu when changing tabs', () => {
    render(<MyReviewsPage />)

    fireEvent.click(screen.getByRole('tab', { name: '작성한 리뷰 4' }))
    fireEvent.click(screen.getAllByLabelText(/리뷰 메뉴 열기/)[0])
    expect(screen.getByRole('menuitem', { name: '수정하기' })).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: '리뷰 쓰기 2' }))
    fireEvent.click(screen.getByRole('tab', { name: '작성한 리뷰 4' }))

    expect(screen.queryByRole('menuitem', { name: '수정하기' })).toBeNull()
  })

  it('navigates to review edit page from written review menu', () => {
    render(<MyReviewsPage />)

    fireEvent.click(screen.getByRole('tab', { name: '작성한 리뷰 4' }))
    fireEvent.click(screen.getAllByLabelText(/리뷰 메뉴 열기/)[0])
    fireEvent.click(screen.getByRole('menuitem', { name: '수정하기' }))

    expect(mockNavigate).toHaveBeenCalledWith('/reviews/written-review-1/edit')
  })

  it('moves back from the header action', () => {
    render(<MyReviewsPage />)

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('navigates to today restaurant when written reviews become empty', () => {
    render(<MyReviewsPage />)

    fireEvent.click(screen.getByRole('tab', { name: '작성한 리뷰 4' }))

    for (let index = 0; index < 4; index += 1) {
      fireEvent.click(screen.getAllByLabelText(/리뷰 메뉴 열기/)[0])
      fireEvent.click(screen.getByRole('menuitem', { name: '삭제하기' }))
      fireEvent.click(
        screen.getByRole('button', {
          name: '삭제하기',
        }),
      )
    }

    fireEvent.click(screen.getByRole('button', { name: '일본 맛집 추천받기' }))

    expect(screen.getByText('작성한 리뷰가 없어요.')).toBeTruthy()
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.todayRestaurant)
  })
})
