import { BackIcon } from '@hashi/hds-icons'
import { Button, Header, IconButton } from '@hashi/hds-ui'

import { NotFoundPage } from '@/pages/notFound'
import { ReservationRescueIntro } from '@/pages/reservationRescue/components/ReservationRescueIntro'
import { ReservationRescueRestaurantList } from '@/pages/reservationRescue/components/ReservationRescueRestaurantList'
import { useReservationRescuePage } from '@/pages/reservationRescue/hooks/useReservationRescuePage'
import { checkIsNotFoundError } from '@/shared/api'
import { LoadingScreen } from '@/shared/components/loadingScreen'

export const ReservationRescuePage = () => {
  const {
    error,
    isInvalidReservationId,
    isReservationError,
    isReservationLoading,
    isRestaurantsError,
    isRestaurantsLoading,
    restaurants,
    shouldRedirect,
    handleBack,
    handleCanceledReservations,
    handleHashiPick,
    handleRestaurant,
    handleRetry,
  } = useReservationRescuePage()

  if (isInvalidReservationId || shouldRedirect) {
    return null
  }

  if (isReservationError) {
    if (checkIsNotFoundError(error)) {
      return <NotFoundPage />
    }

    throw error
  }

  if (isReservationLoading) {
    return <LoadingScreen />
  }

  return (
    <main className="min-h-dvh bg-white pt-18.75 pb-[calc(82px+var(--safe-area-bottom,0px))]">
      <Header
        className="app-mobile-fixed-top z-fixed text-primary-200 fixed"
        leftAction={
          <IconButton aria-label="뒤로가기" onClick={handleBack} size="xs">
            <BackIcon className="size-6" />
          </IconButton>
        }
        title={<h1>식당 다시 찾기</h1>}
      />

      <ReservationRescueIntro />

      <section className="mt-7" aria-labelledby="rescue-restaurants-heading">
        <div className="px-5">
          <h2
            className="typo-sub-header-1 text-primary-200"
            id="rescue-restaurants-heading"
          >
            하시가 다시 골라봤어요
          </h2>
          <p className="typo-body-7 text-cool-gray-600 mt-1">
            하시 PICK 중 평점이 높은 순서예요.
          </p>
        </div>
        <ReservationRescueRestaurantList
          isError={isRestaurantsError}
          isLoading={isRestaurantsLoading}
          onHashiPick={handleHashiPick}
          onRestaurant={handleRestaurant}
          onRetry={handleRetry}
          restaurants={restaurants}
        />
      </section>

      <div className="app-mobile-fixed-bottom z-fixed bg-white px-5 pt-4 pb-[calc(17px+var(--safe-area-bottom,0px))]">
        <Button
          onClick={handleCanceledReservations}
          size="lg"
          variant="neutral"
          width="full"
        >
          취소된 예약 보기
        </Button>
      </div>
    </main>
  )
}
