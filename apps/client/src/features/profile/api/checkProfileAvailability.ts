import { request } from '@/shared/api/request'

export type AvailabilityField = 'nickname' | 'phone' | 'email'

interface FieldAvailability {
  available: boolean
  message?: string
}

export const checkProfileAvailability = async (
  field: AvailabilityField,
  value: string,
  signal: AbortSignal,
): Promise<FieldAvailability> => {
  const data = await request<
    Partial<Record<AvailabilityField, FieldAvailability>>
  >('api/v1/users/availability', {
    method: 'post',
    json: { [field]: value },
    credentials: 'include',
    signal,
  })
  const result = data?.[field]
  if (
    typeof result?.available !== 'boolean' ||
    (!result.available && !result.message)
  ) {
    throw new Error('Invalid profile availability response')
  }
  return result
}
