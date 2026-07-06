import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InputReviewMain } from './InputReviewMain'

const createObjectURLMock = vi.fn((file: File) => `blob:${file.name}`)
const revokeObjectURLMock = vi.fn()

const createImageFiles = (count: number) =>
  Array.from(
    { length: count },
    (_, index) =>
      new File([`image-${index + 1}`], `review-${index + 1}.png`, {
        type: 'image/png',
      }),
  )

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

afterEach(() => {
  cleanup()
  createObjectURLMock.mockClear()
  revokeObjectURLMock.mockClear()
})

describe('InputReviewMain', () => {
  it('renders the review main prompt, optional photo trigger, and textarea', () => {
    render(<InputReviewMain />)

    expect(screen.getByText('리뷰를 작성해주세요.')).toHaveClass(
      'typo-sub-header-1',
      'text-primary-200',
    )
    expect(screen.getByText('(첨부 사진 장당 5MB, 최대 10장)')).toHaveClass(
      'typo-body-7',
      'text-cool-gray-600',
    )

    expect(
      screen.getByRole('button', { name: '사진을 첨부해 주세요. (선택)' }),
    ).toHaveClass('h-[130px]', 'max-w-[353px]', 'rounded-[10px]')
    expect(screen.getByLabelText('리뷰 사진 첨부')).toHaveAttribute(
      'accept',
      'image/*',
    )
    expect(screen.getByLabelText('리뷰 사진 첨부')).toHaveAttribute('multiple')

    expect(screen.getByLabelText('리뷰 내용')).toHaveAttribute(
      'placeholder',
      '리뷰를 작성해 주세요.',
    )
    expect(screen.getByLabelText('리뷰 내용')).toHaveClass(
      'typo-long-body-1',
      'text-primary-200',
    )
    expect(screen.getByLabelText('리뷰 내용')).toHaveAttribute(
      'maxlength',
      '1000',
    )
    expect(screen.getByText('10자 이상')).toHaveClass('text-warm-gray-300')
    expect(
      screen.queryByText('10자 이상 작성해주세요.'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('/1000')).toHaveClass('text-warm-gray-300')
  })

  it('calls onValueChange with the next review text', () => {
    const handleValueChange = vi.fn()

    render(<InputReviewMain onValueChange={handleValueChange} />)

    fireEvent.change(screen.getByLabelText('리뷰 내용'), {
      target: { value: '정말 맛있었어요' },
    })

    expect(handleValueChange).toHaveBeenCalledTimes(1)
    expect(handleValueChange).toHaveBeenCalledWith('정말 맛있었어요')
  })

  it('limits the next review text to maxLength before calling onValueChange', () => {
    const handleValueChange = vi.fn()

    render(<InputReviewMain maxLength={3} onValueChange={handleValueChange} />)

    fireEvent.change(screen.getByLabelText('리뷰 내용'), {
      target: { value: 'abcd' },
    })

    expect(handleValueChange).toHaveBeenCalledTimes(1)
    expect(handleValueChange).toHaveBeenCalledWith('abc')
  })

  it('passes selected photo files to onPhotoFilesChange', () => {
    const handlePhotoFilesChange = vi.fn()
    const imageFile = new File(['image'], 'review.png', { type: 'image/png' })

    render(<InputReviewMain onPhotoFilesChange={handlePhotoFilesChange} />)

    fireEvent.change(screen.getByLabelText('리뷰 사진 첨부'), {
      target: { files: [imageFile] },
    })

    expect(handlePhotoFilesChange).toHaveBeenCalledTimes(1)
    expect(handlePhotoFilesChange).toHaveBeenCalledWith([imageFile])
  })

  it('rejects photo files larger than the max size and shows an error message', () => {
    const handlePhotoFilesChange = vi.fn()
    const validImageFile = new File(['image'], 'review.png', {
      type: 'image/png',
    })
    const largeImageFile = new File(['large-image'], 'large-review.png', {
      type: 'image/png',
    })
    Object.defineProperty(largeImageFile, 'size', {
      value: 6 * 1024 * 1024,
    })

    render(<InputReviewMain onPhotoFilesChange={handlePhotoFilesChange} />)

    fireEvent.change(screen.getByLabelText('리뷰 사진 첨부'), {
      target: { files: [validImageFile, largeImageFile] },
    })

    expect(handlePhotoFilesChange).toHaveBeenCalledTimes(1)
    expect(handlePhotoFilesChange).toHaveBeenCalledWith([validImageFile])
    expect(
      screen.getByText('사진은 장당 5MB 이하로 첨부해주세요.'),
    ).toHaveClass('text-primary-400')
  })

  it('appends newly selected photo files to existing photo files', () => {
    const handlePhotoFilesChange = vi.fn()
    const existingImageFile = new File(['existing-image'], 'existing.png', {
      type: 'image/png',
    })
    const nextImageFile = new File(['next-image'], 'next.png', {
      type: 'image/png',
    })

    render(
      <InputReviewMain
        photoFiles={[existingImageFile]}
        onPhotoFilesChange={handlePhotoFilesChange}
      />,
    )

    fireEvent.change(screen.getByLabelText('리뷰 사진 첨부'), {
      target: { files: [nextImageFile] },
    })

    expect(handlePhotoFilesChange).toHaveBeenCalledTimes(1)
    expect(handlePhotoFilesChange).toHaveBeenCalledWith([
      existingImageFile,
      nextImageFile,
    ])
  })

  it('does not append photo files beyond the max count and shows an error message', () => {
    const handlePhotoFilesChange = vi.fn()
    const existingPhotoFiles = createImageFiles(9)
    const firstNextImageFile = new File(['next-image-1'], 'next-1.png', {
      type: 'image/png',
    })
    const secondNextImageFile = new File(['next-image-2'], 'next-2.png', {
      type: 'image/png',
    })

    render(
      <InputReviewMain
        photoFiles={existingPhotoFiles}
        onPhotoFilesChange={handlePhotoFilesChange}
      />,
    )

    fireEvent.change(screen.getByLabelText('리뷰 사진 첨부'), {
      target: { files: [firstNextImageFile, secondNextImageFile] },
    })

    expect(handlePhotoFilesChange).toHaveBeenCalledTimes(1)
    expect(handlePhotoFilesChange).toHaveBeenCalledWith([
      ...existingPhotoFiles,
      firstNextImageFile,
    ])
    expect(
      screen.getByText('사진은 최대 10장까지 첨부할 수 있어요.'),
    ).toHaveClass('text-primary-400')
  })

  it('clears the max count error when a selected photo is removed', () => {
    const ControlledInputReviewMain = () => {
      const [photoFiles, setPhotoFiles] = useState(createImageFiles(9))

      return (
        <InputReviewMain
          photoFiles={photoFiles}
          onPhotoFilesChange={setPhotoFiles}
        />
      )
    }

    render(<ControlledInputReviewMain />)

    fireEvent.change(screen.getByLabelText('리뷰 사진 첨부'), {
      target: {
        files: [
          new File(['next-image-1'], 'next-1.png', { type: 'image/png' }),
          new File(['next-image-2'], 'next-2.png', { type: 'image/png' }),
        ],
      },
    })

    expect(
      screen.getByText('사진은 최대 10장까지 첨부할 수 있어요.'),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'review-1.png 사진 삭제' }),
    )

    expect(
      screen.queryByText('사진은 최대 10장까지 첨부할 수 있어요.'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '사진을 첨부해 주세요. (선택)' }),
    ).toBeEnabled()
  })

  it('disables the photo add trigger when the max photo count is reached', () => {
    render(<InputReviewMain photoFiles={createImageFiles(10)} />)

    expect(
      screen.getByRole('button', { name: '사진을 첨부해 주세요. (선택)' }),
    ).toBeDisabled()
    expect(screen.getByLabelText('리뷰 사진 첨부')).toBeDisabled()
  })

  it('renders selected photo previews in a horizontally scrollable list', () => {
    const photoFiles = [
      new File(['image-1'], 'review-1.png', { type: 'image/png' }),
      new File(['image-2'], 'review-2.png', { type: 'image/png' }),
    ]

    render(<InputReviewMain photoFiles={photoFiles} />)

    expect(
      screen.getByRole('list', { name: '선택된 리뷰 사진 목록' }),
    ).toHaveClass(
      'overflow-x-auto',
      '[scrollbar-width:none]',
      '[-ms-overflow-style:none]',
      '[&::-webkit-scrollbar]:hidden',
    )
    expect(
      screen.getByRole('img', { name: 'review-1.png 미리보기' }),
    ).toHaveAttribute('src', 'blob:review-1.png')
    expect(
      screen.getByRole('img', { name: 'review-2.png 미리보기' }),
    ).toHaveAttribute('src', 'blob:review-2.png')
  })

  it('removes the selected photo when its delete button is clicked', () => {
    const handlePhotoFilesChange = vi.fn()
    const firstPhotoFile = new File(['image-1'], 'review-1.png', {
      type: 'image/png',
    })
    const secondPhotoFile = new File(['image-2'], 'review-2.png', {
      type: 'image/png',
    })

    render(
      <InputReviewMain
        photoFiles={[firstPhotoFile, secondPhotoFile]}
        onPhotoFilesChange={handlePhotoFilesChange}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'review-1.png 사진 삭제' }),
    )

    expect(handlePhotoFilesChange).toHaveBeenCalledTimes(1)
    expect(handlePhotoFilesChange).toHaveBeenCalledWith([secondPhotoFile])
  })

  it('reflects the controlled value in the textarea counter', () => {
    render(<InputReviewMain value="abcdefghij" />)

    expect(screen.getByLabelText('리뷰 내용')).toHaveValue('abcdefghij')
    expect(screen.getByText('10')).toHaveClass('text-primary-200')
    expect(screen.getByText('10자 이상')).toHaveClass('text-warm-gray-300')
  })

  it('shows helper text after focus when the review text is shorter than ten characters', () => {
    render(<InputReviewMain />)

    fireEvent.focus(screen.getByLabelText('리뷰 내용'))

    expect(screen.getByText('10자 이상 작성해주세요.')).toHaveClass(
      'text-primary-400',
    )
  })

  it('shows helper text based on text length after the textarea is focused', () => {
    render(<InputReviewMain maxLength={3} value="abcd" />)

    const textarea = screen.getByLabelText('리뷰 내용')

    fireEvent.focus(textarea)

    expect(textarea).toHaveValue('abc')
    expect(screen.getByText('글자 수 제한을 초과했어요.')).toHaveClass(
      'text-primary-400',
    )
    expect(screen.getByText('4')).toHaveClass('text-primary-400')
    expect(screen.getByText('/3')).toHaveClass('text-warm-gray-300')
  })

  it('disables the photo trigger and textarea when disabled is true', () => {
    render(<InputReviewMain disabled />)

    expect(
      screen.getByRole('button', { name: '사진을 첨부해 주세요. (선택)' }),
    ).toBeDisabled()
    expect(screen.getByLabelText('리뷰 사진 첨부')).toBeDisabled()
    expect(screen.getByLabelText('리뷰 내용')).toBeDisabled()
  })
})
