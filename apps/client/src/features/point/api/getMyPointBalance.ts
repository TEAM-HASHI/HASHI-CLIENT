import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type PointBalanceResponse = components['schemas']['PointBalanceResponse']

type MyPointBalance = {
  availablePoint: number
}

export const getMyPointBalance = async (): Promise<MyPointBalance> => {
  const response = await request<PointBalanceResponse>('/api/v1/points/me')

  return {
    availablePoint: response?.balance ?? 0,
  }
}
