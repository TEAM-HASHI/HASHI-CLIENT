import type { components } from '@/shared/api/generated/openapi'

type Schema = components['schemas']

// OpenAPI가 필수 필드를 표시하지 않아 서버 DTO의 non-null 계약을 경계에서 보완한다.
export type NoticeSummary = Required<Schema['Item']>
export type NoticeSpan = Required<Omit<Schema['Span'], 'href'>> & {
  href?: string | null
}
export type NoticeBlock = Required<Omit<Schema['NoticeBlock'], 'items'>> & {
  items: NoticeSpan[][]
}
type NoticeAttachment = Required<Omit<Schema['Attachment'], 'image'>> & {
  image: Required<Omit<Schema['MediaImage'], 'defaultSource'>> & {
    defaultSource: Required<Schema['Source']> | null
  }
}
export type NoticeListData = Required<
  Omit<Schema['NoticeListResponse'], 'notices' | 'nextCursor'>
> & {
  notices: NoticeSummary[]
  nextCursor: string | null
}
export type NoticeDetail = Required<
  Omit<Schema['NoticeResponse'], 'body' | 'images'>
> & {
  body: NoticeBlock[]
  images: NoticeAttachment[]
}

// 상세 이미지와 뷰어에서 사용하는 표시 모델. 미처리 이미지는 placeholder로 표시한다.
export interface NoticeImage {
  url: string | null
  width: number
  height: number
}
