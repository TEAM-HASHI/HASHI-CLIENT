import type { NoticeListData } from '@/features/notice/types'
import { request } from '@/shared/api/request'

interface GetNoticesParams {
  cursor: number | null
  size: number
}

export const getNotices = async ({ cursor, size }: GetNoticesParams) => {
  const data = await request<NoticeListData>('/api/v1/notices', {
    searchParams: cursor === null ? { size } : { cursor, size },
  })

  return data ?? { notices: [], hasNext: false, nextCursor: null }
}
