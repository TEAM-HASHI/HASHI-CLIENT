import { useState, type KeyboardEvent, type ReactNode } from 'react'
import {
  CheckIcon,
  HashiPickIcon,
  MagazineIcon,
  PopularIcon,
  TodayRestaurantIcon,
} from '@hashi/hds-icons'
import { Button, Carousel, SearchField } from '@hashi/hds-ui'
import { Link, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import hashiLogoSrc from '@/shared/assets/logos/hashi-logo.svg'
import { useAuthStatus } from '@/shared/hooks'

import { QuickMenuItem } from './components/QuickMenuItem'
import {
  homeBanners,
  hotSnsRestaurants,
  quickLinks,
  type HomeQuickLink,
} from './homeContent'

const getRestaurantDetailPath = (restaurantId: string) => {
  return ROUTES.restaurantDetail.replace(':restaurantId', restaurantId)
}

const quickLinkIcon = {
  hashiPick: <HashiPickIcon />,
  popular: <PopularIcon />,
  magazine: <MagazineIcon />,
  todayRestaurant: <TodayRestaurantIcon />,
} satisfies Record<HomeQuickLink['id'], ReactNode>

export const HomePage = () => {
  const { isAuthenticated } = useAuthStatus()
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(!isAuthenticated)
  const navigate = useNavigate()

  const handleSearchEntryClick = () => {
    navigate(ROUTES.search)
  }

  const handleSearchEntryKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      navigate(ROUTES.search)
    }
  }

  return (
    <>
      <div className="px-[18px] pt-[18px] pb-8">
        <h1 className="sr-only">Hashi 홈</h1>
        <img
          alt="Hashi"
          className="h-[23px] w-[73px]"
          height={23}
          src={hashiLogoSrc}
          width={73}
        />

        <div
          className="mt-[15px] cursor-pointer"
          onClick={handleSearchEntryClick}
        >
          <SearchField
            readOnly
            aria-label="식당 또는 메뉴 검색하기"
            className="cursor-pointer"
            inputClassName="cursor-pointer"
            onKeyDown={handleSearchEntryKeyDown}
            placeholder="식당 혹은 메뉴를 검색해보세요"
          />
        </div>

        <section className="mt-4" aria-labelledby="home-curation-heading">
          <h2
            className="typo-sub-header-1 text-primary-200"
            id="home-curation-heading"
          >
            맛집 큐레이션을 둘러보세요!
          </h2>
          <Carousel.Root
            aria-label="맛집 큐레이션 배너"
            className="mt-2.5"
            defaultIndex={0}
          >
            <Carousel.Viewport className="h-[160px] w-full overflow-y-hidden rounded-[8px]">
              <Carousel.Track>
                {homeBanners.map(({ id, imageUrl, imageAlt, instagramUrl }) => (
                  <Carousel.Item key={id}>
                    <a
                      className="block size-full"
                      href={instagramUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <img
                        alt={imageAlt}
                        className="size-full object-cover"
                        src={imageUrl}
                      />
                    </a>
                  </Carousel.Item>
                ))}
              </Carousel.Track>
            </Carousel.Viewport>
            <Carousel.Indicator
              activeDotClassName="h-1 w-3 bg-cool-gray-700"
              className="bottom-3"
              dotClassName="size-1 bg-warm-gray-300"
            />
          </Carousel.Root>
        </section>

        <nav aria-label="주요 기능" className="mt-6">
          <ul className="flex justify-center gap-10">
            {quickLinks.map(({ id, label, to }) => (
              <li key={id}>
                <QuickMenuItem icon={quickLinkIcon[id]} label={label} to={to} />
              </li>
            ))}
          </ul>
        </nav>

        <section className="bg-cool-gray-800 mt-7 flex items-center justify-between rounded-[10px] py-[18px] pr-[18px] pl-[14px]">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-[23px] shrink-0 items-center justify-center rounded-full bg-black text-[#ff5d5d]"
            >
              <CheckIcon className="size-[23px]" />
            </span>
            <p className="m-0 flex min-w-0 flex-col gap-0">
              <span className="typo-body-5 text-white">원하는 식당으로</span>
              <span className="typo-sub-header-3 text-white">어디든 예약</span>
            </p>
          </div>
          <Button
            className="bg-cool-gray-600 typo-sub-header-3 hover:bg-cool-gray-600 h-auto px-6 py-[9px]"
            onClick={() => {
              navigate(ROUTES.anywhereReservation)
            }}
            type="button"
          >
            예약하기
          </Button>
        </section>

        <section className="mt-[27px]" aria-labelledby="home-sns-heading">
          <h2
            className="typo-sub-header-1 text-primary-200"
            id="home-sns-heading"
          >
            SNS에서 핫한 일본 식당
          </h2>
          <ul className="mt-[29px] flex flex-col gap-[14px]">
            {hotSnsRestaurants.map(
              ({ restaurantId, name, summary, imageUrl, imageAlt }) => (
                <li key={restaurantId}>
                  <Link
                    className="grid grid-cols-[60px_minmax(0,1fr)] gap-4"
                    to={getRestaurantDetailPath(restaurantId)}
                  >
                    <img
                      alt={imageAlt}
                      className="size-[60px] rounded-[5px] object-cover"
                      src={imageUrl}
                    />
                    <span className="flex min-w-0 flex-col justify-center gap-1.5">
                      <span className="typo-sub-header-3 text-primary-200 truncate">
                        {name}
                      </span>
                      <span className="typo-body-8 text-primary-200 truncate">
                        {summary}
                      </span>
                    </span>
                  </Link>
                </li>
              ),
            )}
          </ul>
        </section>
      </div>
      <AuthGateBottomSheet
        open={!isAuthenticated && isAuthGateOpen}
        onKakaoPress={() => {
          // TODO: connect Kakao OAuth flow.
        }}
        onOpenChange={setIsAuthGateOpen}
      />
    </>
  )
}
