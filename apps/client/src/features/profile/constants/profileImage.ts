export const SUPPORTED_PROFILE_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const PROFILE_IMAGE_ACCEPT = SUPPORTED_PROFILE_IMAGE_MIME_TYPES.join(',')
export const PROFILE_IMAGE_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

const SUPPORTED_PROFILE_IMAGE_MIME_TYPE_SET = new Set<string>(
  SUPPORTED_PROFILE_IMAGE_MIME_TYPES,
)

export const checkIsSupportedProfileImageMimeType = (mimeType: string) => {
  return SUPPORTED_PROFILE_IMAGE_MIME_TYPE_SET.has(mimeType)
}
