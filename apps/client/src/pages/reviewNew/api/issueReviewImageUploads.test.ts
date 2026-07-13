import { beforeEach, describe, expect, it, vi } from 'vitest'

import { issueReviewImageUploads } from '@/pages/reviewNew/api/issueReviewImageUploads'

const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn(),
}))

vi.mock('@/shared/api/request', () => ({
  request: requestMock,
}))

beforeEach(() => {
  requestMock.mockReset()
})

describe('issueReviewImageUploads', () => {
  it('requests upload targets in one bulk request using file metadata', async () => {
    const files = [
      new File(['first'], 'first.jpg', { type: 'image/jpeg' }),
      new File(['second'], 'second.png', { type: 'image/png' }),
    ]
    const uploads = [
      {
        uploadUrl: 'https://upload.example/first.jpg',
        fileKey: 'uploads/reviews/first.jpg',
        uploadMethod: 'PUT',
      },
      {
        uploadUrl: 'https://upload.example/second.png',
        fileKey: 'uploads/reviews/second.png',
        uploadMethod: 'PUT',
      },
    ]
    requestMock.mockResolvedValue({ uploads })

    await expect(issueReviewImageUploads(files)).resolves.toEqual(uploads)
    expect(requestMock).toHaveBeenCalledWith('/api/v1/uploads/presigned-urls', {
      method: 'post',
      json: {
        usage: 'review',
        files: [
          { contentType: 'image/jpeg', fileSize: files[0].size },
          { contentType: 'image/png', fileSize: files[1].size },
        ],
      },
    })
  })

  it('rejects when the response count does not match the requested files', async () => {
    requestMock.mockResolvedValue({
      uploads: [
        {
          uploadUrl: 'https://upload.example/first.jpg',
          fileKey: 'uploads/reviews/first.jpg',
        },
      ],
    })

    await expect(
      issueReviewImageUploads([
        new File(['first'], 'first.jpg', { type: 'image/jpeg' }),
        new File(['second'], 'second.jpg', { type: 'image/jpeg' }),
      ]),
    ).rejects.toThrow('이미지 업로드 정보를 확인할 수 없습니다.')
  })

  it('rejects an upload target without an upload URL or file key', async () => {
    requestMock.mockResolvedValue({ uploads: [{}] })

    await expect(
      issueReviewImageUploads([
        new File(['image'], 'review.jpg', { type: 'image/jpeg' }),
      ]),
    ).rejects.toThrow('이미지 업로드 정보를 확인할 수 없습니다.')
  })
})
