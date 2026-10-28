import { queryOptions } from '@tanstack/react-query'
import { getMagazineDetail } from '@/pages/magazineDetail/api/magazineDetailApi'
import { magazineQueryKeys } from '@/features/magazine/queries/magazineQueryKeys'

export const magazineDetailQueryOptions = (
  magazineId: number,
  viewer: number,
) =>
  queryOptions({
    queryKey: magazineQueryKeys.detail(magazineId, viewer),
    queryFn: ({ signal }) => getMagazineDetail(magazineId, signal),
    throwOnError: false,
  })
