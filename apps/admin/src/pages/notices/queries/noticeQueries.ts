import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { noticeApi } from '@/pages/notices/api/noticeApi'

export const noticeKeys = {
  all: ['admin', 'notices'] as const,
  lists: () => [...noticeKeys.all, 'list'] as const,
  list: (page: number) => [...noticeKeys.lists(), page] as const,
  detail: (id: number) => [...noticeKeys.all, 'detail', id] as const,
}

export const noticeListOptions = (page: number) =>
  queryOptions({
    queryKey: noticeKeys.list(page),
    queryFn: ({ signal }) => noticeApi.list(page, signal),
  })

export const noticeDetailOptions = (id: number) =>
  queryOptions({
    queryKey: noticeKeys.detail(id),
    queryFn: ({ signal }) => noticeApi.detail(id, signal),
  })

export const useSaveNoticeMutation = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number | null
      body: Parameters<typeof noticeApi.save>[1]
    }) => noticeApi.save(id, body),
    onSuccess: (notice) => {
      if (notice.noticeId != null)
        client.setQueryData(noticeKeys.detail(notice.noticeId), notice)
      void client.invalidateQueries({ queryKey: noticeKeys.lists() })
    },
  })
}

export const usePublishNoticeMutation = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: noticeApi.publish,
    onSuccess: (notice) => {
      if (notice.noticeId != null)
        client.setQueryData(noticeKeys.detail(notice.noticeId), notice)
      void client.invalidateQueries({ queryKey: noticeKeys.lists() })
    },
  })
}

export const useDeleteNoticeMutation = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: noticeApi.delete,
    onSuccess: (_result, id) => {
      client.removeQueries({ queryKey: noticeKeys.detail(id), exact: true })
      void client.invalidateQueries({ queryKey: noticeKeys.lists() })
    },
  })
}
