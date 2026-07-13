import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { uploadApi, type UploadedImage } from '@/shared/api/uploadApi'
import { AdminImageUploader } from '@/shared/components/AdminImageUploader'

vi.mock('@/shared/api/uploadApi', () => ({
  uploadApi: { uploadImage: vi.fn() },
}))

const Harness = () => {
  const [value, setValue] = useState<UploadedImage[]>([])
  return (
    <AdminImageUploader
      label="식당 이미지"
      usage="restaurant"
      value={value}
      multiple
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
    expect(
      screen.getByRole('button', { name: 'b.webp 앞으로 이동' }),
    ).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'a.webp 삭제' }))
    expect(screen.queryByAltText('a.webp 미리보기')).not.toBeInTheDocument()
  })
})
