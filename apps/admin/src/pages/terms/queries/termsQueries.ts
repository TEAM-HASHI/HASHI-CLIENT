import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { termsApi } from '@/pages/terms/api/termsApi'
import type {
  AdminTerms,
  SaveTerms,
  TermsType,
} from '@/pages/terms/api/termsApi'

export const termsKeys = {
  all: ['admin', 'terms'] as const,
  types: ['admin', 'terms', 'types'] as const,
  histories: ['admin', 'terms', 'history'] as const,
  history: (type: TermsType, page: number) =>
    ['admin', 'terms', 'history', type, page] as const,
  detail: (id: number) => ['admin', 'terms', 'detail', id] as const,
}

export const termsTypesOptions = () =>
  queryOptions({
    queryKey: termsKeys.types,
    queryFn: ({ signal }) => termsApi.types(signal),
  })

export const termsHistoryOptions = (type: TermsType, page: number) =>
  queryOptions({
    queryKey: termsKeys.history(type, page),
    queryFn: ({ signal }) => termsApi.history(type, page, signal),
  })

export const termsDetailOptions = (id: number) =>
  queryOptions({
    queryKey: termsKeys.detail(id),
    queryFn: ({ signal }) => termsApi.detail(id, signal),
  })

export const useSaveTermsMutation = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number | null; body: SaveTerms }) =>
      termsApi.save(id, body),
    onSuccess: async (terms) => {
      if (terms.termsId != null) {
        await client.cancelQueries({
          queryKey: termsKeys.detail(terms.termsId),
          exact: true,
        })
        client.setQueryData(termsKeys.detail(terms.termsId), terms)
      }
      void client.invalidateQueries({ queryKey: termsKeys.histories })
    },
  })
}

export const usePublishTermsMutation = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => termsApi.publish(id),
    onSuccess: async (terms) => {
      // Publishing also archives the previous current version of this type.
      if (terms.termsId != null) {
        await client.cancelQueries({
          queryKey: termsKeys.detail(terms.termsId),
          exact: true,
        })
        client.setQueryData(termsKeys.detail(terms.termsId), terms)
      }
      void client.invalidateQueries({
        queryKey: termsKeys.all,
        predicate: ({ queryKey, state }) =>
          queryKey[2] === 'types' ||
          (queryKey[2] === 'history' && queryKey[3] === terms.type) ||
          (queryKey[2] === 'detail' &&
            queryKey[3] !== terms.termsId &&
            (state.data as AdminTerms | undefined)?.type === terms.type),
      })
    },
  })
}

export const useDeleteTermsMutation = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => termsApi.delete(id),
    onSuccess: (_result, id) => {
      client.removeQueries({ queryKey: termsKeys.detail(id), exact: true })
      void client.invalidateQueries({ queryKey: termsKeys.histories })
    },
  })
}
