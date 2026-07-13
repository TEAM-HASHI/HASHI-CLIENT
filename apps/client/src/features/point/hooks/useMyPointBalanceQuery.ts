import { useQuery } from '@tanstack/react-query'

import { myPointBalanceQueryOptions } from '@/features/point/queries/pointQueryOptions'

export const useMyPointBalanceQuery = () => {
  return useQuery(myPointBalanceQueryOptions)
}
