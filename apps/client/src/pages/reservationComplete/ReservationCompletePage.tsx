import { HashiPointMarkIcon } from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getReservationDetailPath } from '@/app/router/routePaths'
import { useReservationDetailQuery } from '@/features/reservation/queries/useReservationDetailQuery'
import { createReservationReceiptInfoItems } from '@/features/reservation/utils/createReservationReceiptInfoItems'
import { parseReservationId } from '@/features/reservation/utils/parseReservationId'
import { NotFoundPage } from '@/pages/notFound'
import { ReservationCompleteProgress } from '@/pages/reservationComplete/components/ReservationCompleteProgress'
import { checkIsNotFoundError } from '@/shared/api/apiError'
import { Empty } from '@/shared/components/empty'
import { LoadingScreen } from '@/shared/components/loadingScreen'

export const ReservationCompletePage = () => {
  const navigate = useNavigate()
  const params = useParams<{ reservationId: string }>()
  const reservationId = parseReservationId(params.reservationId)
  const {
    data: reservationDetail,
    error,
    isPending,
  } = useReservationDetailQuery(reservationId)

  if (reservationId === null) {
    return <NotFoundPage />
  }

  if (checkIsNotFoundError(error)) {
    return (
      <Empty
        actionLabel="홈으로 돌아가기"
        className="min-h-dvh bg-white px-6"
        description="예약 정보를 찾을 수 없습니다."
        onAction={() => navigate(ROUTES.home, { replace: true })}
      />
    )
  }

  if (error) {
    throw error
  }

  if (isPending || !reservationDetail) {
    return <LoadingScreen />
  }

  const receiptInfoItems = createReservationReceiptInfoItems(reservationDetail)

  const handleConfirmClick = () => {
    navigate(getReservationDetailPath(String(reservationId)), {
      replace: true,
      state: { fromReservationRequest: true },
    })
  }

  return (
    <div className="min-h-dvh bg-white pt-34.25 pb-29.5">
      <section
        aria-labelledby="reservation-complete-heading"
        className="flex flex-col items-center px-10 text-center"
      >
        <HashiPointMarkIcon aria-hidden="true" className="h-[33px] w-[30px]" />
        <h1
          className="typo-header-3 text-primary-200 mt-4.5"
          id="reservation-complete-heading"
        >
          식당 예약 요청 완료!
        </h1>
        <p className="typo-body-5 text-cool-gray-500 mt-3 break-keep">
          접수 순으로 처리되며 검토 후 예약 확정 시
          <br />
          바로 알려드릴게요!
        </p>
      </section>

      <ReservationCompleteProgress className="mx-auto mt-12.5" />

      <div aria-hidden="true" className="bg-cool-gray-50 mt-9.5 h-2" />

      <section
        aria-labelledby="reservation-receipt-info-heading"
        className="bg-cool-gray-50 mx-5 mt-7.75 rounded-[10px] px-5 pt-5 pb-12"
      >
        <h2
          className="typo-sub-header-1 text-primary-200"
          id="reservation-receipt-info-heading"
        >
          예약 접수 정보
        </h2>
        <dl className="mt-13.5 space-y-6.25">
          {receiptInfoItems.map(({ label, value }) => (
            <div
              className="flex items-start justify-between gap-12"
              key={label}
            >
              <dt className="typo-body-4 text-cool-gray-500 shrink-0">
                {label}
              </dt>
              <dd className="typo-body-3 text-primary-200 min-w-0 text-right break-keep">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="app-mobile-fixed-bottom z-fixed bg-white px-5 pt-4 pb-[calc(49px+var(--safe-area-bottom,0px))]">
        <Button
          className="h-[46px]"
          onClick={handleConfirmClick}
          size="lg"
          width="full"
        >
          확인 완료
        </Button>
      </div>
    </div>
  )
}
