import { Carousel } from '@hashi/hds-ui'

import { ROUTES } from '@/app/router/path'
import pointsIconUrl from '@/pages/mypage/assets/event-banner-points.svg'

type MypageEventBannerItem = {
  id: string
  text: string
  highlight: string
  path: string
}

// Figma 캐러셀은 3장이지만 확정된 건 친구 초대뿐이다. 배너가 늘면 여기에 추가한다.
const MYPAGE_EVENT_BANNERS: MypageEventBannerItem[] = [
  {
    id: 'friend-invite',
    text: '친구 초대하고',
    highlight: '400 포인트 받기',
    path: ROUTES.friendInvite,
  },
]

type MypageEventBannerProps = {
  onNavigate: (path: string) => void
}

export const MypageEventBanner = ({ onNavigate }: MypageEventBannerProps) => {
  return (
    <Carousel.Root aria-label="이벤트 배너">
      <Carousel.Viewport>
        <Carousel.Track>
          {MYPAGE_EVENT_BANNERS.map((banner) => (
            <Carousel.Item key={banner.id}>
              <button
                className="bg-primary-100 hover:bg-warm-gray-50 flex h-15.75 w-full items-center justify-between rounded-[5px] pr-5.25 pl-3.75 text-left"
                onClick={() => onNavigate(banner.path)}
                type="button"
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="typo-caption-1 text-cool-gray-600 font-medium">
                    [EVENT]
                  </span>
                  <span className="typo-body-3 text-cool-gray-900 truncate">
                    {banner.text}{' '}
                    <span className="text-primary-400 font-semibold">
                      {banner.highlight}
                    </span>
                  </span>
                </span>
                <img
                  alt=""
                  className="h-9.5 w-11.5 shrink-0"
                  src={pointsIconUrl}
                />
              </button>
            </Carousel.Item>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>
      {/* 배너가 한 장이면 인디케이터가 숨겨지므로 자리를 고정해 아래 간격을 유지한다. */}
      <div className="mt-2.5 flex h-1.5 justify-center">
        <Carousel.Indicator
          activeDotClassName="bg-warm-gray-300"
          className="gap-1"
          dotClassName="bg-warm-gray-100 size-1.5"
          placement="inline"
        />
      </div>
    </Carousel.Root>
  )
}
