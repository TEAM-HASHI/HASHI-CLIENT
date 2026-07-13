import { HttpStatusError } from '@/shared/api/apiError'

import type { ReviewImageUploadTarget } from '@/pages/reviewNew/api/issueReviewImageUploads'

export const uploadFileToPresignedUrl = async (
  file: File,
  { uploadMethod, uploadUrl }: ReviewImageUploadTarget,
) => {
  const response = await fetch(uploadUrl, {
    method: uploadMethod,
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })

  if (!response.ok) {
    throw new HttpStatusError(response.status)
  }
}
