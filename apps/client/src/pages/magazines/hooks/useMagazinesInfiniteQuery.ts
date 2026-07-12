import { useInfiniteQuery } from '@tanstack/react-query'

import type { MagazineListQueryParams } from '@/pages/magazines/queries/magazineListQueryKeys'
import { magazineListInfiniteQueryOptions } from '@/pages/magazines/queries/magazineListQueryOptions'

export const useMagazinesInfiniteQuery = (params: MagazineListQueryParams) => {
  return useInfiniteQuery(magazineListInfiniteQueryOptions(params))
}
