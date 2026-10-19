import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  mapRegionApi,
  type SaveRegion,
} from '@/features/mapRegion/api/mapRegionApi'

export const regionKeys = {
  all: ['admin', 'map-region'] as const,
  list: (page: number) => ['admin', 'map-region', 'list', page] as const,
  choices: ['admin', 'map-region', 'choices'] as const,
}
export const regionListOptions = (page: number) =>
  queryOptions({
    queryKey: regionKeys.list(page),
    queryFn: ({ signal }) => mapRegionApi.list(page, signal),
    staleTime: 0,
  })
export const regionChoiceOptions = () =>
  infiniteQueryOptions({
    queryKey: regionKeys.choices,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => mapRegionApi.list(pageParam, signal),
    getNextPageParam: (last) =>
      last.page + 1 < last.totalPages ? last.page + 1 : undefined,
    staleTime: 0,
  })
export const useSaveRegionMutation = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ code, body }: { code: string; body: SaveRegion }) =>
      mapRegionApi.save(code, body),
    onSuccess: () => client.invalidateQueries({ queryKey: regionKeys.all }),
  })
}
