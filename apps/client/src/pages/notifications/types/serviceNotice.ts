import type { NoticeBlock, NoticeImage } from '@/features/notice/types'

export type ServiceNoticeType = 'notice' | 'event' | 'update'

// 퍼블리싱 표시 모델이며, 아직 확정되지 않은 서버 응답 타입이 아니다.
export interface ServiceNotice {
  id: number
  type: ServiceNoticeType
  title: string
  displayDate: string
  isRead: boolean
  body: NoticeBlock[]
  images: NoticeImage[]
}
