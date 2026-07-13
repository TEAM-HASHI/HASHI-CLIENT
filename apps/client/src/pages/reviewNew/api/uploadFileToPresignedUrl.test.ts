import { afterEach, describe, expect, it, vi } from 'vitest'

import { uploadFileToPresignedUrl } from '@/pages/reviewNew/api/uploadFileToPresignedUrl'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('uploadFileToPresignedUrl', () => {
  it('uploads the raw file with the target method and content type', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const file = new File(['review-image'], 'review.jpg', {
      type: 'image/jpeg',
    })

    await uploadFileToPresignedUrl(file, {
      uploadUrl: 'https://upload.example/review.jpg',
      fileKey: 'uploads/reviews/review.jpg',
      uploadMethod: 'PUT',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://upload.example/review.jpg',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: file,
      },
    )
  })

  it('rejects a failed S3 response with its HTTP status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    )

    await expect(
      uploadFileToPresignedUrl(
        new File(['review-image'], 'review.jpg', { type: 'image/jpeg' }),
        {
          uploadUrl: 'https://upload.example/review.jpg',
          fileKey: 'uploads/reviews/review.jpg',
          uploadMethod: 'PUT',
        },
      ),
    ).rejects.toMatchObject({ status: 503 })
  })
})
