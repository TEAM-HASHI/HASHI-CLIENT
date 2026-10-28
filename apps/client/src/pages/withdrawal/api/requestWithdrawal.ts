import { request } from '@/shared/api/request'

export const requestWithdrawal = async (): Promise<void> => {
  await request<null>('api/v1/users/me', {
    method: 'delete',
    credentials: 'include',
  })
}
