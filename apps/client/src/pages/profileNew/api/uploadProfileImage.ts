import { checkIsSupportedProfileImageMimeType } from '@/pages/profileNew/constants/profileImage'
import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'
import { uploadFileToPresignedUrl } from '@/shared/api/uploadFileToPresignedUrl'

type IssuePresignedUrlsBody = components['schemas']['IssuePresignedUrlsRequest']
type PresignedUrlsData = components['schemas']['PresignedUrlsResponse']
type PresignedUrlData = components['schemas']['PresignedUrlResponse']

const PROFILE_IMAGE_UPLOAD_USAGE = 'profile'

const checkIsValidProfileImageUploadTarget = (
  target: PresignedUrlData | undefined,
): target is PresignedUrlData & { uploadUrl: string; fileKey: string } => {
  return Boolean(target?.uploadUrl && target.fileKey)
}

const issueProfileImageUploadTarget = async (file: File) => {
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

  if (!checkIsValidProfileImageUploadTarget(presignedUrl)) {
    throw new Error('프로필 이미지 업로드 응답이 올바르지 않습니다.')
  }

  return presignedUrl
}

const uploadProfileImageToTarget = async (
  file: File,
  target: PresignedUrlData & { uploadUrl: string; fileKey: string },
) => {
  await uploadFileToPresignedUrl(file, {
    uploadUrl: target.uploadUrl,
    uploadMethod: target.uploadMethod ?? 'PUT',
  })
}

export const uploadProfileImage = async (file: File): Promise<string> => {
  if (!checkIsSupportedProfileImageMimeType(file.type)) {
    throw new Error('지원하지 않는 프로필 이미지 형식입니다.')
  }

  const firstTarget = await issueProfileImageUploadTarget(file)

  try {
    await uploadProfileImageToTarget(file, firstTarget)
    return firstTarget.fileKey
  } catch {
    const retryTarget = await issueProfileImageUploadTarget(file)

    await uploadProfileImageToTarget(file, retryTarget)
    return retryTarget.fileKey
  }
}
