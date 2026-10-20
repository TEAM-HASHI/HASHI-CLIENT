import { useQuery } from '@tanstack/react-query'
import { magazineCatalogApi } from '@/pages/magazines/api/magazineCatalogApi'
import { magazineQueryKeys } from '@/pages/magazines/queries/magazineQueryKeys'

export const useMagazineDetailQuery = (id: number | null) =>
  useQuery({
    queryKey: magazineQueryKeys.detail(id ?? 0),
    queryFn: ({ signal }) => magazineCatalogApi.detail(id!, signal),
    enabled: id !== null,
    staleTime: 0,
    gcTime: 0,
  })
