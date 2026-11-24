import noticeExample from '@/shared/assets/images/notifications/notice-example.png'
import type { ServiceNotice } from '@/pages/notifications/types'

const body: ServiceNotice['body'] = [
  {
    type: 'PARAGRAPH',
    items: [
      [
        {
          text: '더 안정적인 예약 서비스를 위해 시스템 점검을 진행합니다.',
          bold: false,
        },
      ],
    ],
  },
  {
    type: 'BULLET_LIST',
    items: [
      [{ text: '일시: 9월 10일(목) 오전 2시–4시', bold: false }],
      [
        {
          text: '점검 중에는 맛집 검색 및 예약 신청이 일시적으로 제한될 수 있습니다.',
          bold: false,
        },
      ],
    ],
  },
  {
    type: 'PARAGRAPH',
    items: [
      [{ text: '이용에 참고 부탁드립니다.\n\n감사합니다.', bold: false }],
    ],
  },
]

const designItems: Pick<ServiceNotice, 'type' | 'title' | 'isRead'>[] = [
  {
    type: 'notice',
    title: '[ 첫 출시 EVENT ] 하시의 공지사항 안내합니다.',
    isRead: false,
  },
  {
    type: 'notice',
    title: '[ 첫 출시 EVENT ] 제목은 한 줄 이상 넘가면 이렇게 잘려요.',
    isRead: true,
  },
  {
    type: 'event',
    title: '[ 첫 출시 EVENT!! ] 하시의 이벤트 안내합니다',
    isRead: false,
  },
  {
    type: 'event',
    title: '[ 첫 출시 EVENT ] 하시의 이벤트 안내 읽으면 이렇게 됩니다.',
    isRead: true,
  },
  {
    type: 'update',
    title: '[ 첫 출시 EVENT ] 하시의 업데이트 안내합니다.',
    isRead: false,
  },
  {
    type: 'update',
    title: '[ 첫 출시 EVENT ] 하시의 업데이트 안내합니다.',
    isRead: true,
  },
]

// 예시 데이터만 사용한다. API 연동 시 이 파일의 source를 교체한다.
export const SERVICE_NOTICE_FIXTURES: ServiceNotice[] = Array.from(
  { length: 20 },
  (_, index) => {
    const item = designItems[index % designItems.length]
    return {
      ...item,
      id: index + 1,
      title:
        index < 6 ? item.title : `[서비스 안내 ${index + 1}] Hashi 이용 안내`,
      displayDate: index < 6 ? '2026.06.29' : '2026.06.28',
      body,
      images: [{ url: noticeExample, width: 353, height: 177 }],
    }
  },
)
