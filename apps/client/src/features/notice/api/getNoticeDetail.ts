import type { NoticeDetail } from '@/features/notice/types'
import { request } from '@/shared/api/request'

export const getNoticeDetail = async (noticeId: number) => {
  const data = await request<NoticeDetail>(`/api/v1/notices/${noticeId}`)

  if (!data) {
    throw new Error('Notice detail response data is empty')
  }

  return data
}
