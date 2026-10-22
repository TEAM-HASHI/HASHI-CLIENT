import type { components } from '@/shared/api/generated/notice-openapi'
import { request } from '@/shared/api/request'

type Uploads = components['schemas']['CreateMediaAssetsResponse']
type Statuses = components['schemas']['MediaAssetStatusesResponse']

export const validateNoticeImage = (file: File) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw new Error('JPG, PNG, WebP 이미지만 첨부할 수 있습니다.')
  if (file.size <= 0 || file.size > 10 * 1024 * 1024)
    throw new Error('이미지는 한 장당 10MB 이하로 첨부해주세요.')
}

const waitForProcessing = (signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    signal.throwIfAborted()
    const abort = () => {
      clearTimeout(timer)
      reject(signal.reason)
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, 2000)
    signal.addEventListener('abort', abort, { once: true })
  })

export const uploadNoticeImage = async (
  file: File,
  signal: AbortSignal,
): Promise<string> => {
  validateNoticeImage(file)
  const result = await request<Uploads>('/api/v1/media/assets', {
    method: 'post',
    signal,
    json: {
      purpose: 'NOTICE',
      files: [{ contentType: file.type, fileSize: file.size }],
    },
  })
  const upload = result.uploads?.[0]
  if (!upload?.assetId || !upload.uploadUrl || upload.uploadMethod !== 'PUT')
    throw new Error('이미지 업로드 정보를 확인할 수 없습니다.')
  const response = await fetch(upload.uploadUrl, {
    method: 'PUT',
    body: file,
    signal,
    credentials: 'omit',
    headers: { 'Content-Type': file.type, ...upload.requiredHeaders },
  })
  if (!response.ok) throw new Error('이미지 업로드에 실패했습니다.')
  let statuses = await request<Statuses>('/api/v1/media/assets/complete', {
    method: 'post',
    json: { assetIds: [upload.assetId] },
    signal,
  })
  for (let attempt = 0; attempt < 30; attempt += 1) {
    signal.throwIfAborted()
    const status = statuses.assets?.find(
      (asset) => asset.assetId === upload.assetId,
    )?.status
    if (status === 'READY') return upload.assetId
    if (status === 'FAILED' || status === 'EXPIRED')
      throw new Error('이미지 처리에 실패했습니다. 다시 업로드해주세요.')
    await waitForProcessing(signal)
    statuses = await request<Statuses>('/api/v1/media/assets', {
      searchParams: { assetIds: upload.assetId },
      signal,
    })
  }
  throw new Error('이미지 처리가 지연되고 있습니다. 잠시 후 다시 시도해주세요.')
}
