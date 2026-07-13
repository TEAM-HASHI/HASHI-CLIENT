import { beforeEach, describe, expect, it, vi } from 'vitest'

import { uploadProfileImage } from '@/pages/profileNew/api/uploadProfileImage'
import { uploadFileToPresignedUrl } from '@/shared/api/uploadFileToPresignedUrl'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

vi.mock('@/shared/api/uploadFileToPresignedUrl', () => ({
  uploadFileToPresignedUrl: vi.fn(),
}))

const mockedRequest = vi.mocked(request)
const mockedUploadFileToPresignedUrl = vi.mocked(uploadFileToPresignedUrl)

describe('uploadProfileImage', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
    mockedUploadFileToPresignedUrl.mockReset()
  })

  it('issues a profile presigned URL and uploads the image with the shared presigned URL uploader', async () => {
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
    mockedUploadFileToPresignedUrl.mockResolvedValue(undefined)

    await expect(uploadProfileImage(file)).resolves.toEqual(
      'users/15/profile/profile.webp',
    )
    expect(mockedRequest).toHaveBeenCalledWith(
      'api/v1/uploads/presigned-urls',
      {
        method: 'post',
        credentials: 'include',
        json: {
          usage: 'profile',
          files: [{ contentType: 'image/webp', fileSize: 1024 }],
        },
      },
    )
    expect(mockedUploadFileToPresignedUrl).toHaveBeenCalledWith(file, {
      uploadUrl: 'https://upload.example/profile.webp',
      uploadMethod: 'PUT',
    })
  })

  it('rejects when presigned URL response does not include an upload URL and file key', async () => {
    const file = new File(['profile'], 'profile.png', { type: 'image/png' })

    mockedRequest.mockResolvedValue({ uploads: [{}] })

    await expect(uploadProfileImage(file)).rejects.toThrow(
      '프로필 이미지 업로드 응답이 올바르지 않습니다.',
    )
    expect(mockedUploadFileToPresignedUrl).not.toHaveBeenCalled()
  })

  it('rejects when the shared presigned URL uploader fails', async () => {
    const file = new File(['profile'], 'profile.png', { type: 'image/png' })
    const uploadError = new Error('temporary upload failure')

    mockedRequest.mockResolvedValue({
      uploads: [
        {
          uploadUrl: 'https://upload.example/profile.png',
          fileKey: 'users/15/profile/profile.png',
          uploadMethod: 'PUT',
        },
      ],
    })
    mockedUploadFileToPresignedUrl.mockRejectedValue(uploadError)

    await expect(uploadProfileImage(file)).rejects.toThrow(uploadError)
  })

  it('reissues a presigned URL and retries once when the first S3 upload fails', async () => {
    const file = new File(['profile'], 'profile.png', { type: 'image/png' })

    mockedRequest
      .mockResolvedValueOnce({
        uploads: [
          {
            uploadUrl: 'https://upload.example/first-profile.png',
            fileKey: 'users/15/profile/first-profile.png',
            uploadMethod: 'PUT',
          },
        ],
      })
      .mockResolvedValueOnce({
        uploads: [
          {
            uploadUrl: 'https://upload.example/retry-profile.png',
            fileKey: 'users/15/profile/retry-profile.png',
            uploadMethod: 'PUT',
          },
        ],
      })
    mockedUploadFileToPresignedUrl
      .mockRejectedValueOnce(new Error('temporary upload failure'))
      .mockResolvedValueOnce(undefined)

    await expect(uploadProfileImage(file)).resolves.toBe(
      'users/15/profile/retry-profile.png',
    )
    expect(mockedRequest).toHaveBeenCalledTimes(2)
    expect(mockedUploadFileToPresignedUrl).toHaveBeenNthCalledWith(2, file, {
      uploadUrl: 'https://upload.example/retry-profile.png',
      uploadMethod: 'PUT',
    })
  })

  it('rejects unsupported profile image MIME types before issuing a presigned URL', async () => {
    const file = new File(['profile'], 'profile.gif', { type: 'image/gif' })

    await expect(uploadProfileImage(file)).rejects.toThrow(
      '지원하지 않는 프로필 이미지 형식입니다.',
    )
    expect(mockedRequest).not.toHaveBeenCalled()
    expect(mockedUploadFileToPresignedUrl).not.toHaveBeenCalled()
  })
})
