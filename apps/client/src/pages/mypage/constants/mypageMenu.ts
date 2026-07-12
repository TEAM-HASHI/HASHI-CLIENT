import { ROUTES } from '@/app/router/path'
import type { MypageMenuItem, MypageMenuSection } from '@/pages/mypage/types'
import { HASHI_KAKAO_CHANNEL_URL } from '@/shared/constants/contact'

export const HASHI_NOTICE_URL =
  'https://ringed-mitten-50f.notion.site/Hashi-399c804d7e5e80b1991bd7b1f5165b0b'
export const HASHI_TERMS_URL =
  'https://ringed-mitten-50f.notion.site/Hashi-38dc804d7e5e80eebf2be0fc0ae448ac'

export const createMypagePrimaryMenuItems = ({
  myReviewCount,
}: {
  myReviewCount: number
}): MypageMenuItem[] => [
  {
    id: 'saved-restaurants',
    label: '내가 찜한 식당',
    count: 0,
    highlighted: true,
    action: {
      type: 'comingSoon',
    },
  },
  {
    id: 'my-reviews',
    label: '마이 리뷰',
    count: myReviewCount,
    action: {
      type: 'navigate',
      path: ROUTES.myReviews,
    },
  },
]

export const mypageMenuSections: MypageMenuSection[] = [
  {
    id: 'service',
    title: '서비스 이용',
    items: [
      {
        id: 'notice',
        label: '공지사항',
        action: {
          type: 'external',
          url: HASHI_NOTICE_URL,
        },
      },
      {
        id: 'contact',
        label: '문의하기',
        action: {
          type: 'external',
          url: HASHI_KAKAO_CHANNEL_URL,
        },
      },
      {
        id: 'suggestion',
        label: '개선 제안',
        action: {
          type: 'external',
          url: HASHI_KAKAO_CHANNEL_URL,
        },
      },
      {
        id: 'terms',
        label: '이용약관',
        action: {
          type: 'external',
          url: HASHI_TERMS_URL,
        },
      },
    ],
  },
]
