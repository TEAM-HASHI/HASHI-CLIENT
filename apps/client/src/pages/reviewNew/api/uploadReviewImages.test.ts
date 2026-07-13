import { beforeEach, describe, expect, it, vi } from 'vitest'

import { uploadReviewImages } from '@/pages/reviewNew/api/uploadReviewImages'

const { issueReviewImageUploadsMock, uploadFileToPresignedUrlMock } =
  vi.hoisted(() => ({
    issueReviewImageUploadsMock: vi.fn(),
    uploadFileToPresignedUrlMock: vi.fn(),
  }))

vi.mock('@/pages/reviewNew/api/issueReviewImageUploads', () => ({
  issueReviewImageUploads: issueReviewImageUploadsMock,
}))

vi.mock('@/shared/api/uploadFileToPresignedUrl', () => ({
  uploadFileToPresignedUrl: uploadFileToPresignedUrlMock,
}))

const createFile = (name: string) =>
  new File([name], name, { type: 'image/jpeg' })

const createTarget = (file: File, attempt = 1) => ({
  uploadUrl: `https://upload.example/${attempt}/${file.name}`,
  fileKey: `uploads/reviews/${file.name}`,
  uploadMethod: 'PUT',
})

beforeEach(() => {
  issueReviewImageUploadsMock.mockReset()
  uploadFileToPresignedUrlMock.mockReset()
  issueReviewImageUploadsMock.mockImplementation((files: File[]) =>
    Promise.resolve(files.map((file) => createTarget(file))),
  )
  uploadFileToPresignedUrlMock.mockResolvedValue(undefined)
})

describe('uploadReviewImages', () => {
  it('rejects unsupported MIME types before issuing presigned URLs', async () => {
    const unsupportedFile = new File(['image'], 'review.gif', {
      type: 'image/gif',
    })

    await expect(uploadReviewImages([unsupportedFile])).rejects.toThrow(
      'JPG, PNG, WEBP 형식의 사진만 첨부할 수 있어요.',
    )
    expect(issueReviewImageUploadsMock).not.toHaveBeenCalled()
    expect(uploadFileToPresignedUrlMock).not.toHaveBeenCalled()
  })

  it('uploads the bulk targets in parallel and returns keys in file order', async () => {
    const files = [createFile('first.jpg'), createFile('second.jpg')]

    await expect(uploadReviewImages(files)).resolves.toEqual([
      'uploads/reviews/first.jpg',
      'uploads/reviews/second.jpg',
    ])
    expect(issueReviewImageUploadsMock).toHaveBeenCalledTimes(1)
    expect(issueReviewImageUploadsMock).toHaveBeenCalledWith(files)
    expect(uploadFileToPresignedUrlMock).toHaveBeenCalledTimes(2)
  })

  it('requests fresh targets only for failed files and retries them once', async () => {
    const firstFile = createFile('first.jpg')
    const secondFile = createFile('second.jpg')
    let secondUploadAttempts = 0
    issueReviewImageUploadsMock
      .mockResolvedValueOnce([
        createTarget(firstFile),
        createTarget(secondFile),
      ])
      .mockResolvedValueOnce([createTarget(secondFile, 2)])
    uploadFileToPresignedUrlMock.mockImplementation((file: File) => {
      if (file === secondFile && secondUploadAttempts === 0) {
        secondUploadAttempts += 1
        return Promise.reject(new Error('temporary upload failure'))
      }

      return Promise.resolve()
    })

    await expect(uploadReviewImages([firstFile, secondFile])).resolves.toEqual([
      'uploads/reviews/first.jpg',
      'uploads/reviews/second.jpg',
    ])
    expect(issueReviewImageUploadsMock).toHaveBeenNthCalledWith(1, [
      firstFile,
      secondFile,
    ])
    expect(issueReviewImageUploadsMock).toHaveBeenNthCalledWith(2, [secondFile])
    expect(uploadFileToPresignedUrlMock).toHaveBeenCalledTimes(3)
  })

  it('rejects when a retried upload still fails', async () => {
    const file = createFile('failed.jpg')
    issueReviewImageUploadsMock
      .mockResolvedValueOnce([createTarget(file)])
      .mockResolvedValueOnce([createTarget(file, 2)])
    uploadFileToPresignedUrlMock.mockRejectedValue(
      new Error('persistent upload failure'),
    )

    await expect(uploadReviewImages([file])).rejects.toThrow(
      'persistent upload failure',
    )
    expect(issueReviewImageUploadsMock).toHaveBeenCalledTimes(2)
    expect(uploadFileToPresignedUrlMock).toHaveBeenCalledTimes(2)
  })

  it('skips presigned URL issuance when no images are selected', async () => {
    await expect(uploadReviewImages([])).resolves.toEqual([])
    expect(issueReviewImageUploadsMock).not.toHaveBeenCalled()
  })
})
