import { request } from '@/shared/api/request'
import type { components } from '@/shared/api/generated/openapi'

type IssuePresignedUrlsBody = components['schemas']['IssuePresignedUrlsRequest']
type PresignedUrlsResponse = components['schemas']['PresignedUrlsResponse']
type PresignedUrlResponse = components['schemas']['PresignedUrlResponse']

export type ReviewImageUploadTarget = Omit<
  PresignedUrlResponse,
  'uploadUrl' | 'fileKey' | 'uploadMethod'
> & {
  uploadUrl: string
  fileKey: string
  uploadMethod: string
}

const isValidUploadTarget = (
  target: PresignedUrlResponse | undefined,
): target is PresignedUrlResponse & { uploadUrl: string; fileKey: string } => {
  return Boolean(target?.uploadUrl && target.fileKey)
}

export const issueReviewImageUploads = async (
  files: File[],
): Promise<ReviewImageUploadTarget[]> => {
  const body: IssuePresignedUrlsBody = {
    usage: 'review',
    files: files.map((file) => ({
      contentType: file.type,
      fileSize: file.size,
    })),
  }
  const data = await request<PresignedUrlsResponse>(
    '/api/v1/uploads/presigned-urls',
    {
      method: 'post',
      json: body,
    },
  )
  const uploads = data?.uploads

  if (
    !uploads ||
    uploads.length !== files.length ||
    !uploads.every(isValidUploadTarget)
  ) {
    throw new Error('이미지 업로드 정보를 확인할 수 없습니다.')
  }

  return uploads.map((upload) => ({
    ...upload,
    uploadUrl: upload.uploadUrl,
    fileKey: upload.fileKey,
    uploadMethod: upload.uploadMethod ?? 'PUT',
  }))
}
