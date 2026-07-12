import { beforeEach, describe, expect, it, vi } from 'vitest'
import { request } from '@/shared/api/request'
import { uploadApi } from '@/shared/api/uploadApi'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const requestMock = vi.mocked(request)
const fetchMock = vi.fn()

describe('uploadApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('issues a presigned URL and uploads the image with its MIME type', async () => {
    const file = new File([new Uint8Array(1024)], 'image.webp', {
      type: 'image/webp',
    })
    requestMock.mockResolvedValue({
      uploadUrl: 'https://upload.example/image',
      fileKey: 'restaurant/image.webp',
      fileUrl: 'https://cdn.example/image.webp',
    })
    fetchMock.mockResolvedValue({ ok: true })

    await expect(uploadApi.uploadImage(file, 'restaurant')).resolves.toEqual({
      fileKey: 'restaurant/image.webp',
      fileUrl: 'https://cdn.example/image.webp',
      fileName: 'image.webp',
      contentType: 'image/webp',
    })

    expect(requestMock).toHaveBeenCalledWith('/api/v1/uploads/presigned-urls', {
      method: 'post',
      json: {
        usage: 'restaurant',
        contentType: 'image/webp',
        fileSize: 1024,
      },
    })
    expect(fetchMock).toHaveBeenCalledWith('https://upload.example/image', {
      method: 'PUT',
      headers: { 'Content-Type': 'image/webp' },
      body: file,
    })
  })

  it('rejects when object storage returns a non-2xx response', async () => {
    const file = new File(['image'], 'image.png', { type: 'image/png' })
    requestMock.mockResolvedValue({
      uploadUrl: 'https://upload.example/image',
      fileKey: 'restaurant/image.png',
      fileUrl: 'https://cdn.example/image.png',
    })
    fetchMock.mockResolvedValue({ ok: false })

    await expect(uploadApi.uploadImage(file, 'restaurant')).rejects.toThrow(
      '이미지 업로드에 실패했습니다.',
    )
  })
})
