import { beforeEach, describe, expect, it, vi } from 'vitest'

import { uploadProfileImage } from '@/pages/profileNew/api/uploadProfileImage'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockedRequest = vi.mocked(request)
const mockedFetch = vi.fn()

describe('uploadProfileImage', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
    mockedFetch.mockReset()
    vi.stubGlobal('fetch', mockedFetch)
  })

  it('issues a profile presigned URL and uploads the image with its MIME type', async () => {
    const file = new File([new Uint8Array(1024)], 'profile.webp', {
      type: 'image/webp',
    })

    mockedRequest.mockResolvedValue({
      uploads: [
        {
          uploadUrl: 'https://upload.example/profile.webp',
          fileKey: 'users/15/profile/profile.webp',
          fileUrl: 'https://cdn.example/profile.webp',
          expiresInSeconds: 300,
          uploadMethod: 'PUT',
        },
      ],
    })
    mockedFetch.mockResolvedValue({ ok: true })

    await expect(uploadProfileImage(file)).resolves.toEqual(
      'users/15/profile/profile.webp',
    )
    expect(mockedRequest).toHaveBeenCalledWith(
      'api/v1/uploads/presigned-urls',
      {
        method: 'post',
        json: {
          usage: 'profile',
          files: [{ contentType: 'image/webp', fileSize: 1024 }],
        },
      },
    )
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://upload.example/profile.webp',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'image/webp' },
        body: file,
      },
    )
  })

  it('rejects when presigned URL response does not include an upload URL and file key', async () => {
    const file = new File(['profile'], 'profile.png', { type: 'image/png' })

    mockedRequest.mockResolvedValue({ uploads: [{}] })

    await expect(uploadProfileImage(file)).rejects.toThrow(
      '프로필 이미지 업로드 응답이 올바르지 않습니다.',
    )
    expect(mockedFetch).not.toHaveBeenCalled()
  })

  it('rejects when object storage upload fails', async () => {
    const file = new File(['profile'], 'profile.png', { type: 'image/png' })

    mockedRequest.mockResolvedValue({
      uploads: [
        {
          uploadUrl: 'https://upload.example/profile.png',
          fileKey: 'users/15/profile/profile.png',
          uploadMethod: 'PUT',
        },
      ],
    })
    mockedFetch.mockResolvedValue({ ok: false })

    await expect(uploadProfileImage(file)).rejects.toThrow(
      '프로필 이미지 업로드에 실패했습니다.',
    )
  })
})
