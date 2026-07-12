import { infiniteQueryOptions } from '@tanstack/react-query'

import { getMagazines } from '@/pages/magazines/api/getMagazines'
import {
  type MagazineListQueryParams,
  magazineListQueryKeys,
} from '@/pages/magazines/queries/magazineListQueryKeys'

export const magazineListInfiniteQueryOptions = ({
  size,
}: MagazineListQueryParams) =>
  infiniteQueryOptions({
    queryKey: magazineListQueryKeys.infiniteList({ size }),
    queryFn: ({ pageParam }) =>
      getMagazines({
        size,
        ...(pageParam === null ? {} : { cursor: pageParam }),
      }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNext !== true) {
        return undefined
      }

      return lastPage.nextCursor ?? undefined
    },
  })
