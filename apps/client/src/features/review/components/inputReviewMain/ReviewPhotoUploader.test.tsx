import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ReviewPhotoUploader } from '@/features/review/components/inputReviewMain/ReviewPhotoUploader'

const renderReviewPhotoUploader = (
  overrides: Partial<Parameters<typeof ReviewPhotoUploader>[0]> = {},
) => {
  const props = {
    disabled: false,
    hasReachedMaxPhotoCount: false,
    hasSelectedPhotoFiles: false,
    photoErrorMessage: '',
    photoInputId: 'review-photo-input',
    photoInputRef: createRef<HTMLInputElement>(),
    photoPreviewItems: [],
    onPhotoDeleteClick: vi.fn(),
    onPhotoInputChange: vi.fn(),
    onPhotoTriggerClick: vi.fn(),
    ...overrides,
  }

  render(<ReviewPhotoUploader {...props} />)

  return props
}

describe('ReviewPhotoUploader', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the empty photo trigger with responsive width', () => {
    const { onPhotoTriggerClick } = renderReviewPhotoUploader()

    const trigger = screen.getByRole('button', {
      name: '사진을 첨부해 주세요. (선택)',
    })

    expect(trigger).toHaveClass('w-full', 'max-w-full', 'rounded-[10px]')
    expect(screen.getByLabelText('리뷰 사진 첨부')).toHaveAttribute(
      'accept',
      'image/jpeg,image/png,image/webp',
    )
    expect(screen.getByLabelText('리뷰 사진 첨부')).toHaveAttribute('multiple')

    fireEvent.click(trigger)

    expect(onPhotoTriggerClick).toHaveBeenCalledTimes(1)
  })

  it('renders selected photo previews in a horizontally scrollable list', () => {
    const onPhotoDeleteClick = vi.fn()

    renderReviewPhotoUploader({
      hasSelectedPhotoFiles: true,
      photoPreviewItems: [
        {
          id: 'review-1',
          name: 'review-1.png',
          src: 'blob:review-1.png',
        },
      ],
      onPhotoDeleteClick,
    })

    expect(
      screen.getByRole('list', { name: '선택된 리뷰 사진 목록' }),
    ).toHaveClass(
      'max-w-full',
      'min-w-0',
      'overflow-x-auto',
      'overflow-y-hidden',
    )
    expect(
      screen.getByRole('button', { name: '사진을 첨부해 주세요. (선택)' }),
    ).toHaveClass('size-[130px]', 'rounded-[5px]')
    expect(screen.queryByText('사진 추가')).not.toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'review-1.png 미리보기' }),
    ).toHaveClass('rounded-[5px]')

    fireEvent.click(
      screen.getByRole('button', { name: 'review-1.png 사진 삭제' }),
    )

    expect(onPhotoDeleteClick).toHaveBeenCalledTimes(1)
    expect(onPhotoDeleteClick).toHaveBeenCalledWith(0)
  })

  it('renders the photo error message', () => {
    renderReviewPhotoUploader({
      photoErrorMessage: '사진은 최대 10장까지 첨부할 수 있어요.',
    })

    expect(
      screen.getByText('사진은 최대 10장까지 첨부할 수 있어요.'),
    ).toHaveClass('typo-body-7', 'text-primary-400')
  })
})
