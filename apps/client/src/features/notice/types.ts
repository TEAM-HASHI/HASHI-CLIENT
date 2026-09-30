// ponytail: 백엔드 공지사항 API가 OpenAPI에 아직 없어 기존 cursor 목록 API(매거진, 내 예약)
// 형식과 HASHI-PLAN MYPAGE_NOTICE 명세를 따른 가계약입니다. Swagger가 확정되면 generated 타입으로
// 교체하고 api 함수만 맞춥니다.
export interface NoticeSummary {
  noticeId: number
  title: string
  publishedAt: string
  updatedAt: string | null
}

export interface NoticeListData {
  notices: NoticeSummary[]
  hasNext: boolean
  nextCursor: number | null
}

export interface NoticeImage {
  url: string
  width: number
  height: number
}

export interface NoticeDetail extends NoticeSummary {
  /** 허용 태그(strong, b, br, p, ul, ol, li, a)만 쓰는 HTML */
  content: string
  images: NoticeImage[]
}
