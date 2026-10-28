import type { NoticeListData } from '@/features/notice/types'
import { request } from '@/shared/api/request'

interface GetNoticesParams {
  cursor: string | null
}

export const getNotices = async ({ cursor }: GetNoticesParams) => {
  const data = await request<NoticeListData>('/api/v1/notices', {
    searchParams: cursor === null ? {} : { cursor },
  })

  if (!data) throw new Error('Notice list response data is empty')
  return data
}
