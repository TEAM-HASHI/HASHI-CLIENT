import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type PointBalanceResponse = components['schemas']['PointBalanceResponse']

type MyPointBalance = {
  availablePoint: number
}

export const getMyPointBalance = async (): Promise<MyPointBalance> => {
  const response = await request<PointBalanceResponse>('/api/v1/points/me')

  if (typeof response?.balance !== 'number') {
    throw new Error('포인트 잔액 응답에 유효한 balance가 없습니다.')
  }

  return {
    availablePoint: response.balance,
  }
}
