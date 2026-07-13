import { HttpStatusError } from '@/shared/api/apiError'

export interface PresignedUrlUploadTarget {
  uploadUrl: string
  uploadMethod: string
}

export const uploadFileToPresignedUrl = async (
  file: File,
  { uploadMethod, uploadUrl }: PresignedUrlUploadTarget,
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
