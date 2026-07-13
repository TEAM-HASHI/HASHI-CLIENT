import { REVIEW_PHOTO_TYPE_ERROR_MESSAGE } from '@/features/review/constants'
import { checkIsSupportedReviewPhotoFile } from '@/features/review/utils'
import { issueReviewImageUploads } from '@/pages/reviewNew/api/issueReviewImageUploads'
import { uploadFileToPresignedUrl } from '@/shared/api/uploadFileToPresignedUrl'

interface FailedUpload {
  file: File
  originalIndex: number
}

export const uploadReviewImages = async (files: File[]) => {
  if (files.length === 0) {
    return []
  }

  if (!files.every(checkIsSupportedReviewPhotoFile)) {
    throw new Error(REVIEW_PHOTO_TYPE_ERROR_MESSAGE)
  }

  const initialTargets = await issueReviewImageUploads(files)
  const initialResults = await Promise.allSettled(
    files.map((file, index) =>
      uploadFileToPresignedUrl(file, initialTargets[index]),
    ),
  )
  const imageFileKeys = initialTargets.map(({ fileKey }) => fileKey)
  const failedUploads = initialResults.reduce<FailedUpload[]>(
    (failures, result, index) => {
      if (result.status === 'rejected') {
        failures.push({ file: files[index], originalIndex: index })
      }

      return failures
    },
    [],
  )

  if (failedUploads.length === 0) {
    return imageFileKeys
  }

  const retryFiles = failedUploads.map(({ file }) => file)
  const retryTargets = await issueReviewImageUploads(retryFiles)

  await Promise.all(
    retryFiles.map((file, index) =>
      uploadFileToPresignedUrl(file, retryTargets[index]),
    ),
  )

  failedUploads.forEach(({ originalIndex }, retryIndex) => {
    imageFileKeys[originalIndex] = retryTargets[retryIndex].fileKey
  })

  return imageFileKeys
}
