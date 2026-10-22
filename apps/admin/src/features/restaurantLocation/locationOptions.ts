export const LOCATION_STATUSES = [
  { value: 'REVIEW_REQUIRED', label: '검토 필요' },
  { value: 'UNRESOLVED', label: '미확인' },
  { value: 'PENDING', label: '처리 중' },
  { value: 'READY', label: '확인 완료' },
  { value: 'RETRY_WAIT', label: '재시도 대기' },
  { value: 'FAILED', label: '처리 중단' },
] as const
export const LOCATION_SOURCES = [
  { value: 'GOOGLE_GEOCODING', label: 'Google 주소 확인' },
  { value: 'GOOGLE_PLACES', label: 'Google Places' },
  { value: 'ADMIN', label: '자체 좌표' },
] as const

export const locationStatusLabel = (value?: string) =>
  LOCATION_STATUSES.find((item) => item.value === value)?.label ?? value ?? '-'
export const locationSourceLabel = (value?: string) =>
  LOCATION_SOURCES.find((item) => item.value === value)?.label ?? value ?? '-'
export const locationErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : '위치 정보를 확인하지 못했습니다. 다시 시도해주세요.'
export const formatLocationTime = (value?: string) =>
  value ? new Date(value).toLocaleString('ko-KR') : '-'
export const canSearchPlaces = (status?: string) =>
  ['READY', 'REVIEW_REQUIRED', 'FAILED', 'RETRY_WAIT'].includes(status ?? '')

export const safeExternalUrl = (value?: string) => {
  try {
    const url = new URL(value ?? '')
    return url.protocol === 'https:' && !url.username && !url.password
      ? url.href
      : undefined
  } catch {
    return undefined
  }
}
