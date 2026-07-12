import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type PointBalanceResponse = components['schemas']['PointBalanceResponse']

type MypagePointBalance = {
  availablePoint: number
}

export const getMyPointBalance = async (): Promise<MypagePointBalance> => {
  const response = await request<PointBalanceResponse>('/api/v1/points/me')

  return {
    availablePoint: response?.balance ?? 0,
  }
}
