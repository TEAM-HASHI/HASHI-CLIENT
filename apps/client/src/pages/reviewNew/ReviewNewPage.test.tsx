import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReviewNewPage } from './ReviewNewPage'

const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}))

const createObjectURLMock = vi.fn((file: File) => `blob:${file.name}`)
const revokeObjectURLMock = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}))

beforeEach(() => {
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: createObjectURLMock,
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: revokeObjectURLMock,
  })
})

const fillRequiredReviewFields = () => {
  fireEvent.click(screen.getByRole('radio', { name: '4점' }))
  fireEvent.click(screen.getByRole('button', { name: '친절해요' }))
  fireEvent.change(screen.getByLabelText('리뷰 내용'), {
    target: { value: '정말 맛있었어요 최고예요' },
  })
}

afterEach(() => {
  cleanup()
  navigateMock.mockClear()
  createObjectURLMock.mockClear()
  revokeObjectURLMock.mockClear()
})

describe('ReviewNewPage', () => {
  it('renders the review writing flow with the save button disabled by default', () => {
    render(<ReviewNewPage />)

    expect(screen.getByText('리뷰 작성')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: '리뷰 대상 예약 정보' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        '야키토리 무사시 제목은 여기까지 그러나 최대길이 이 정도로까지',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('2026. 6. 22 17:00 방문')).toBeInTheDocument()
    expect(screen.getByText('어른 2명')).toBeInTheDocument()
    expect(screen.getByText('이 맛집 어떠셨나요?')).toBeInTheDocument()
    expect(screen.getByText('어떤 점이 좋으셨나요?')).toBeInTheDocument()
    expect(screen.getByText('리뷰를 작성해주세요.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled()
  })

  it('returns to the entry route when the back button is clicked', () => {
    render(<ReviewNewPage />)

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(navigateMock).toHaveBeenCalledTimes(1)
    expect(navigateMock).toHaveBeenCalledWith(-1)
  })

  it('enables the save button when required review fields are valid', () => {
    render(<ReviewNewPage />)

    fillRequiredReviewFields()

    expect(screen.getByRole('button', { name: '저장하기' })).toBeEnabled()
  })

  it('keeps the save button disabled when the review text is shorter than ten characters', () => {
    render(<ReviewNewPage />)

    fireEvent.click(screen.getByRole('radio', { name: '4점' }))
    fireEvent.click(screen.getByRole('button', { name: '친절해요' }))
    fireEvent.change(screen.getByLabelText('리뷰 내용'), {
      target: { value: '짧아요' },
    })

    expect(screen.getByText('10자 이상 작성해주세요.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled()
  })

  it('caps selected photos at ten and disables the photo add trigger', () => {
    render(<ReviewNewPage />)

    fillRequiredReviewFields()

    const photoFiles = Array.from(
      { length: 11 },
      (_, index) =>
        new File(['image'], `review-${index}.png`, { type: 'image/png' }),
    )

    fireEvent.change(screen.getByLabelText('리뷰 사진 첨부'), {
      target: { files: photoFiles },
    })

    expect(
      screen.getByText('사진은 최대 10장까지 첨부할 수 있어요.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'review-9.png 미리보기' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('img', { name: 'review-10.png 미리보기' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '사진을 첨부해 주세요. (선택)' }),
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: '저장하기' })).toBeEnabled()
  })

  it('shows selected photo previews after photo files are selected', () => {
    render(<ReviewNewPage />)

    const photoFile = new File(['image'], 'review.png', { type: 'image/png' })

    fireEvent.change(screen.getByLabelText('리뷰 사진 첨부'), {
      target: { files: [photoFile] },
    })

    expect(
      screen.getByRole('list', { name: '선택된 리뷰 사진 목록' }),
    ).toHaveClass(
      'max-w-full',
      'min-w-0',
      'overflow-x-auto',
      'overflow-y-hidden',
      '[scrollbar-width:none]',
      '[-ms-overflow-style:none]',
      '[&::-webkit-scrollbar]:hidden',
    )
    expect(
      screen.getByRole('img', { name: 'review.png 미리보기' }),
    ).toHaveAttribute('src', 'blob:review.png')
  })

  it('rejects a selected photo larger than five megabytes before storing it', () => {
    render(<ReviewNewPage />)

    const largePhotoFile = new File(['large-image'], 'large-review.png', {
      type: 'image/png',
    })
    Object.defineProperty(largePhotoFile, 'size', {
      value: 6 * 1024 * 1024,
    })

    fireEvent.change(screen.getByLabelText('리뷰 사진 첨부'), {
      target: { files: [largePhotoFile] },
    })

    expect(
      screen.getByText('사진은 장당 5MB 이하로 첨부해주세요.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('img', { name: 'large-review.png 미리보기' }),
    ).not.toBeInTheDocument()
  })

  it('appends selected photo previews when photos are selected multiple times', () => {
    render(<ReviewNewPage />)

    const firstPhotoFile = new File(['first-image'], 'first.png', {
      type: 'image/png',
    })
    const secondPhotoFile = new File(['second-image'], 'second.png', {
      type: 'image/png',
    })
    const photoInput = screen.getByLabelText('리뷰 사진 첨부')

    fireEvent.change(photoInput, {
      target: { files: [firstPhotoFile] },
    })
    fireEvent.change(photoInput, {
      target: { files: [secondPhotoFile] },
    })

    expect(
      screen.getByRole('img', { name: 'first.png 미리보기' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'second.png 미리보기' }),
    ).toBeInTheDocument()
  })
})
