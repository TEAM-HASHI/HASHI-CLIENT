import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type IssuePresignedUrlsBody = components['schemas']['IssuePresignedUrlsRequest']
type PresignedUrlsData = components['schemas']['PresignedUrlsResponse']

const PROFILE_IMAGE_UPLOAD_USAGE = 'profile'
const SUPPORTED_PROFILE_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

export const uploadProfileImage = async (file: File): Promise<string> => {
  if (!SUPPORTED_PROFILE_IMAGE_MIME_TYPES.has(file.type)) {
    throw new Error('지원하지 않는 프로필 이미지 형식입니다.')
  }

  const body = {
    usage: PROFILE_IMAGE_UPLOAD_USAGE,
    files: [{ contentType: file.type, fileSize: file.size }],
  } satisfies IssuePresignedUrlsBody

  const presignedUrls = await request<PresignedUrlsData>(
    'api/v1/uploads/presigned-urls',
    {
      method: 'post',
      credentials: 'include',
      json: body,
    },
  )
  const presignedUrl = presignedUrls?.uploads?.[0]

  if (!presignedUrl?.uploadUrl || !presignedUrl.fileKey) {
    throw new Error('프로필 이미지 업로드 응답이 올바르지 않습니다.')
  }

  const response = await fetch(presignedUrl.uploadUrl, {
    method: presignedUrl.uploadMethod ?? 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  if (!response.ok) {
    throw new Error('프로필 이미지 업로드에 실패했습니다.')
  }

  return presignedUrl.fileKey
}
