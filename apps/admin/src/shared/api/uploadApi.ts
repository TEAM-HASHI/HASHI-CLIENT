import { ADMIN_ENDPOINTS } from '@/shared/api/adminEndpoints'
import type { components, paths } from '@/shared/api/generated/user-openapi'
import { request } from '@/shared/api/request'

type IssuePresignedUrlsBody =
  paths['/api/v1/uploads/presigned-urls']['post']['requestBody']['content']['application/json']
type PresignedUrlsData = components['schemas']['PresignedUrlsResponse']

export type UploadUsage = 'restaurant' | 'restaurant-menu' | 'magazine'

export interface UploadedImage {
  fileKey: string
  fileUrl: string
  fileName: string
  contentType: string
}

export const uploadApi = {
  async uploadImage(file: File, usage: UploadUsage): Promise<UploadedImage> {
    const body = {
      usage,
      files: [{ contentType: file.type, fileSize: file.size }],
    } satisfies IssuePresignedUrlsBody
    const presignedUrls = await request<PresignedUrlsData>(
      ADMIN_ENDPOINTS.presignedUpload,
      {
        method: 'post',
        json: body,
      },
    )
    const presigned = presignedUrls.uploads?.[0]

    if (!presigned?.uploadUrl || !presigned.fileKey || !presigned.fileUrl) {
      throw new Error('업로드 URL 응답이 올바르지 않습니다.')
    }

    const response = await fetch(presigned.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    if (!response.ok) {
      throw new Error('이미지 업로드에 실패했습니다.')
    }

    return {
      fileKey: presigned.fileKey,
      fileUrl: presigned.fileUrl,
      fileName: file.name,
      contentType: file.type,
    }
  },
}
