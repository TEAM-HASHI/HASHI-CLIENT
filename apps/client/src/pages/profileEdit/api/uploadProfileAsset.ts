import {
  checkIsSupportedProfileImageMimeType,
  PROFILE_IMAGE_MAX_FILE_SIZE_BYTES,
} from '@/features/profile/constants/profileImage'
import { HttpStatusError } from '@/shared/api/apiError'
import { request } from '@/shared/api/request'

const PROFILE_IMAGE_POLL_INTERVAL_MS = 1000
const PROFILE_IMAGE_MAX_POLL_COUNT = 30

interface ProfileUpload {
  assetId: string
  uploadUrl: string
  uploadMethod: string
  requiredHeaders: Record<string, string>
  expectedContentLength: number
}

interface AssetStatus {
  assetId: string
  status: 'PENDING_UPLOAD' | 'PROCESSING' | 'READY' | 'FAILED' | 'EXPIRED'
}

const waitForProcessing = (signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    signal.throwIfAborted()
    const onAbort = () => {
      clearTimeout(timer)
      reject(signal.reason)
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, PROFILE_IMAGE_POLL_INTERVAL_MS)
    signal.addEventListener('abort', onAbort, { once: true })
  })

export const uploadProfileAsset = async (
  file: File,
  signal: AbortSignal,
): Promise<string> => {
  if (
    !checkIsSupportedProfileImageMimeType(file.type) ||
    file.size === 0 ||
    file.size > PROFILE_IMAGE_MAX_FILE_SIZE_BYTES
  ) {
    throw new Error('Invalid profile image')
  }
  const data = await request<{ uploads: ProfileUpload[] }>(
    'api/v1/media/assets',
    {
      method: 'post',
      credentials: 'include',
      signal,
      json: {
        purpose: 'PROFILE',
        files: [{ contentType: file.type, fileSize: file.size }],
      },
    },
  )
  const target = data?.uploads?.[0]
  if (
    !target?.assetId ||
    !target.uploadUrl ||
    !target.uploadMethod ||
    !target.requiredHeaders ||
    target.expectedContentLength !== file.size
  ) {
    throw new Error('Invalid profile upload response')
  }
  const response = await fetch(target.uploadUrl, {
    method: target.uploadMethod,
    headers: target.requiredHeaders,
    body: file,
    signal,
  })
  if (!response.ok) throw new HttpStatusError(response.status)

  let statuses = await request<{ assets: AssetStatus[] }>(
    'api/v1/media/assets/complete',
    {
      method: 'post',
      credentials: 'include',
      signal,
      json: { assetIds: [target.assetId] },
    },
  )
  for (let attempt = 0; attempt <= PROFILE_IMAGE_MAX_POLL_COUNT; attempt += 1) {
    const asset = statuses?.assets?.find(
      ({ assetId }) => assetId === target.assetId,
    )
    if (asset?.status === 'READY') return target.assetId
    if (asset?.status !== 'PROCESSING')
      throw new Error('Profile image processing failed')
    if (attempt === PROFILE_IMAGE_MAX_POLL_COUNT) break
    await waitForProcessing(signal)
    statuses = await request<{ assets: AssetStatus[] }>('api/v1/media/assets', {
      credentials: 'include',
      signal,
      searchParams: { assetIds: target.assetId },
    })
  }
  throw new Error('Profile image processing timed out')
}
