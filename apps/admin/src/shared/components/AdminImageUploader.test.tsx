import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { uploadApi, type UploadedImage } from '@/shared/api/uploadApi'
import { AdminImageUploader } from '@/shared/components/AdminImageUploader'

vi.mock('@/shared/api/uploadApi', () => ({
  uploadApi: { uploadImage: vi.fn() },
}))

const Harness = ({
  preserveOrder = false,
  maxFiles,
}: {
  preserveOrder?: boolean
  maxFiles?: number
}) => {
  const [value, setValue] = useState<UploadedImage[]>([])
  return (
    <AdminImageUploader
      label="식당 이미지"
      usage="restaurant"
      value={value}
      previewFrames={[
        { label: '상세', aspectRatio: '393 / 234' },
        { label: '목록', aspectRatio: '1 / 1' },
      ]}
      multiple
      preserveOrder={preserveOrder}
      maxFiles={maxFiles}
      representativeLabel
      onChange={setValue}
    />
  )
}

describe('AdminImageUploader', () => {
  beforeEach(() => {
    vi.mocked(uploadApi.uploadImage).mockReset()
  })

  it('uploads from an accessible file input and exposes ordering controls', async () => {
    vi.mocked(uploadApi.uploadImage)
      .mockResolvedValueOnce({
        fileKey: 'restaurant/a.webp',
        fileUrl: 'https://cdn.example/a.webp',
        fileName: 'a.webp',
        contentType: 'image/webp',
      })
      .mockResolvedValueOnce({
        fileKey: 'restaurant/b.webp',
        fileUrl: 'https://cdn.example/b.webp',
        fileName: 'b.webp',
        contentType: 'image/webp',
      })
    render(<Harness />)

    fireEvent.change(screen.getByLabelText('식당 이미지'), {
      target: {
        files: [
          new File(['a'], 'a.webp', { type: 'image/webp' }),
          new File(['b'], 'b.webp', { type: 'image/webp' }),
        ],
      },
    })

    await waitFor(() => expect(screen.getByText('대표 이미지')).toBeVisible())
    const detailPreview = screen.getByAltText('a.webp 상세 미리보기')
    expect(detailPreview.parentElement).toHaveStyle({
      aspectRatio: '393 / 234',
    })
    expect(screen.getByAltText('a.webp 목록 미리보기')).toHaveStyle({
      aspectRatio: '1 / 1',
    })
    expect(
      screen.getByRole('button', { name: 'b.webp 앞으로 이동' }),
    ).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'a.webp 삭제' }))
    expect(
      screen.queryByAltText('a.webp 상세 미리보기'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByAltText('a.webp 목록 미리보기'),
    ).not.toBeInTheDocument()
  })

  it('keeps selection order after out-of-order completion and retry without undoing later manual ordering', async () => {
    const uploaded = (name: string) => ({
      fileKey: `${name}.png`,
      fileUrl: `https://cdn.example/${name}.png`,
      fileName: `${name}.png`,
      contentType: 'image/png',
    })
    let rejectA!: (error: Error) => void
    let resolveB!: (image: UploadedImage) => void
    vi.mocked(uploadApi.uploadImage)
      .mockReturnValueOnce(
        new Promise((_, reject) => {
          rejectA = reject
        }),
      )
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveB = resolve
        }),
      )
    render(<Harness preserveOrder />)
    fireEvent.change(screen.getByLabelText('식당 이미지'), {
      target: {
        files: ['a', 'b'].map(
          (name) => new File([name], `${name}.png`, { type: 'image/png' }),
        ),
      },
    })
    await act(async () => resolveB(uploaded('b')))
    await act(async () => rejectA(new Error('failed')))
    vi.mocked(uploadApi.uploadImage).mockResolvedValue(uploaded('a'))
    fireEvent.click(screen.getByRole('button', { name: 'a.png 다시 시도' }))
    await screen.findByAltText('a.png 상세 미리보기')
    expect(
      screen
        .getAllByAltText(/상세 미리보기/)
        .map((image) => image.getAttribute('alt')),
    ).toEqual(['a.png 상세 미리보기', 'b.png 상세 미리보기'])
    fireEvent.click(screen.getByRole('button', { name: 'b.png 앞으로 이동' }))
    vi.mocked(uploadApi.uploadImage).mockResolvedValue(uploaded('c'))
    fireEvent.change(screen.getByLabelText('식당 이미지'), {
      target: { files: [new File(['c'], 'c.png', { type: 'image/png' })] },
    })
    await screen.findByAltText('c.png 상세 미리보기')
    expect(
      screen
        .getAllByAltText(/상세 미리보기/)
        .map((image) => image.getAttribute('alt')),
    ).toEqual([
      'b.png 상세 미리보기',
      'a.png 상세 미리보기',
      'c.png 상세 미리보기',
    ])
  })

  it('counts pending and failed files toward the limit and frees a slot after removal', async () => {
    let resolveUpload!: (image: UploadedImage) => void
    vi.mocked(uploadApi.uploadImage)
      .mockRejectedValueOnce(new Error('failed'))
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveUpload = resolve
        }),
      )
    render(<Harness preserveOrder maxFiles={2} />)
    const select = (names: string[]) =>
      fireEvent.change(screen.getByLabelText('식당 이미지'), {
        target: {
          files: names.map(
            (name) => new File([name], `${name}.png`, { type: 'image/png' }),
          ),
        },
      })
    select(['a', 'b'])
    await screen.findByRole('button', { name: 'a.png 다시 시도' })
    select(['c'])
    expect(uploadApi.uploadImage).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('alert')).toHaveTextContent('최대 2장')
    fireEvent.click(screen.getByRole('button', { name: 'a.png 항목 삭제' }))
    vi.mocked(uploadApi.uploadImage).mockResolvedValue({
      fileKey: 'c',
      fileUrl: 'https://cdn.example/c.png',
      fileName: 'c.png',
      contentType: 'image/png',
    })
    select(['c'])
    await screen.findByAltText('c.png 상세 미리보기')
    await act(async () =>
      resolveUpload({
        fileKey: 'b',
        fileUrl: 'https://cdn.example/b.png',
        fileName: 'b.png',
        contentType: 'image/png',
      }),
    )
    expect(uploadApi.uploadImage).toHaveBeenCalledTimes(3)
  })
})
