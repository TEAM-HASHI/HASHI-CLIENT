import { queryOptions } from '@tanstack/react-query'

import { getMyPointBalance } from '@/features/point/api/getMyPointBalance'
import { pointQueryKeys } from '@/features/point/queries/pointQueryKeys'

export const myPointBalanceQueryOptions = queryOptions({
  queryFn: getMyPointBalance,
  queryKey: pointQueryKeys.myBalance(),
})
