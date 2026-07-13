import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { InputReviewKeyword } from '@/features/review/components'

afterEach(() => {
  cleanup()
})

describe('InputReviewKeyword', () => {
  it('renders keyword options supplied by the review context API', () => {
    render(
      <InputReviewKeyword
        keywordOptions={[
          { id: 'FOOD_IS_DELICIOUS', label: '음식이 정말 맛있어요' },
          { id: 'STAFF_IS_KIND', label: '직원분이 친절해요' },
        ]}
      />,
    )

    expect(
      screen.getByRole('button', { name: '음식이 정말 맛있어요' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '직원분이 친절해요' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '향신료가 강하지 않아요' }),
    ).not.toBeInTheDocument()
  })

  it('renders the keyword prompt and all review keyword badges', () => {
    render(<InputReviewKeyword />)

    expect(screen.getByText('어떤 점이 좋으셨나요?')).toHaveClass(
      'typo-sub-header-1',
      'text-primary-200',
    )
    expect(screen.getByText('( 키워드를 1개~3개 선택해주세요.)')).toHaveClass(
      'typo-body-7',
      'text-cool-gray-600',
    )
    expect(
      screen.getByRole('group', { name: '리뷰 키워드 선택' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: '음식이 맛있어요' }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('button', { name: '향신료가 강하지 않아요' }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('button', { name: '혼밥하기 좋아요' }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: '친절해요' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(
      screen.getByRole('button', { name: '매장이 넓어요' }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('button', { name: '매장이 청결해요' }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('button', { name: '음식이 빨리 나와요' }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('button', { name: '사진이 잘 나와요' }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('button', { name: '가성비가 좋아요' }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('button', { name: '대화하기 좋아요' }),
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('marks selected keywords as pressed', () => {
    render(
      <InputReviewKeyword selectedKeywordIds={['delicious', 'cleanStore']} />,
    )

    expect(
      screen.getByRole('button', { name: '음식이 맛있어요' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: '매장이 청결해요' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '친절해요' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('adds an unselected keyword when fewer than three keywords are selected', () => {
    const handleSelectedKeywordIdsChange = vi.fn()

    render(
      <InputReviewKeyword
        selectedKeywordIds={['delicious']}
        onSelectedKeywordIdsChange={handleSelectedKeywordIdsChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '친절해요' }))

    expect(handleSelectedKeywordIdsChange).toHaveBeenCalledTimes(1)
    expect(handleSelectedKeywordIdsChange).toHaveBeenCalledWith([
      'delicious',
      'kind',
    ])
  })

  it('removes a selected keyword when it is clicked again', () => {
    const handleSelectedKeywordIdsChange = vi.fn()

    render(
      <InputReviewKeyword
        selectedKeywordIds={['delicious', 'kind']}
        onSelectedKeywordIdsChange={handleSelectedKeywordIdsChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '음식이 맛있어요' }))

    expect(handleSelectedKeywordIdsChange).toHaveBeenCalledTimes(1)
    expect(handleSelectedKeywordIdsChange).toHaveBeenCalledWith(['kind'])
  })

  it('prevents adding another keyword when three keywords are already selected', () => {
    const handleSelectedKeywordIdsChange = vi.fn()

    render(
      <InputReviewKeyword
        selectedKeywordIds={['delicious', 'kind', 'cleanStore']}
        onSelectedKeywordIdsChange={handleSelectedKeywordIdsChange}
      />,
    )

    const unselectedKeyword = screen.getByRole('button', {
      name: '대화하기 좋아요',
    })
    const selectedKeyword = screen.getByRole('button', { name: '친절해요' })

    expect(unselectedKeyword).toHaveAttribute('aria-disabled', 'true')
    expect(unselectedKeyword).toHaveClass('cursor-not-allowed', 'opacity-40')
    expect(selectedKeyword).not.toHaveAttribute('aria-disabled')
    expect(selectedKeyword).not.toHaveClass('cursor-not-allowed', 'opacity-40')

    fireEvent.click(unselectedKeyword)

    expect(handleSelectedKeywordIdsChange).not.toHaveBeenCalled()
  })
})
