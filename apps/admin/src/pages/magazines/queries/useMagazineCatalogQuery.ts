import { useInfiniteQuery } from '@tanstack/react-query'
import {
  magazineCatalogApi,
  type MagazineCatalogParams,
} from '@/pages/magazines/api/magazineCatalogApi'
import { magazineQueryKeys } from '@/pages/magazines/queries/magazineQueryKeys'

export const useMagazineCatalogQuery = (
  params: Omit<MagazineCatalogParams, 'cursor'>,
) =>
  useInfiniteQuery({
    queryKey: magazineQueryKeys.list(params),
    queryFn: ({ pageParam }) =>
      magazineCatalogApi.list({
        ...params,
        cursor: pageParam ?? undefined,
      }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  })
