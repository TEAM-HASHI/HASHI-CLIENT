import { useQuery } from '@tanstack/react-query'

import { getMyPointBalance } from '@/features/point/api/getMyPointBalance'

export const MY_POINT_BALANCE_QUERY_KEY = ['point', 'myBalance'] as const

export const useMyPointBalanceQuery = () => {
  return useQuery({
    queryFn: getMyPointBalance,
    queryKey: MY_POINT_BALANCE_QUERY_KEY,
  })
}
