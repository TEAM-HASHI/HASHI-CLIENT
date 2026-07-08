import { BackIcon } from '@hashi/hds-icons'
import { Calendar, Header, IconButton } from '@hashi/hds-ui'
import type { SyntheticEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { GuestCounter } from '@/features/reservation/components/guestCounter'

import { ReservationBottomBar } from '@/pages/restaurantReservationNew/components/ReservationBottomBar'
import { ReservationRestaurantSummary } from '@/pages/restaurantReservationNew/components/ReservationRestaurantSummary'
import { ReservationTimeSelector } from '@/pages/restaurantReservationNew/components/ReservationTimeSelector'
import { UnderlineTextField } from '@/pages/restaurantReservationNew/components/UnderlineTextField'
import { useReservationRestaurant } from '@/pages/restaurantReservationNew/hooks/useReservationRestaurant'
import { useRestaurantReservationForm } from '@/pages/restaurantReservationNew/hooks/useRestaurantReservationForm'

const RESERVATION_FORM_ID = 'restaurant-reservation-new-form'

export const RestaurantReservationNewPage = () => {
  const navigate = useNavigate()
  const { restaurantId } = useParams()
  const restaurant = useReservationRestaurant(restaurantId)
  const { calendar, fields, guestCounters, submit, timeSelector } =
    useRestaurantReservationForm({ restaurant })

  const handleBackClick = () => {
    navigate(-1)
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    const reservationDraft = submit.createReservationDraft()

    if (!reservationDraft) {
      return
    }

    navigate(ROUTES.reservationRequest, {
      state: reservationDraft,
    })
  }

  return (
    <div className="min-h-dvh bg-white pb-[128px]">
      <Header
        className="z-fixed sticky top-0"
        leftAction={
          <IconButton aria-label="뒤로가기" onClick={handleBackClick} size="xs">
            <BackIcon className="size-6" />
          </IconButton>
        }
        title="예약하기"
      />

      <div className="px-6 pt-6.5">
        <ReservationRestaurantSummary
          imageUrl={restaurant.imageUrl}
          name={restaurant.name}
        />

        <form
          className="mt-8.75 flex flex-col gap-13.75"
          id={RESERVATION_FORM_ID}
          onSubmit={handleSubmit}
        >
          <UnderlineTextField
            autoComplete="name"
            label="예약자명"
            name="guestName"
            onValueChange={fields.guestName.onValueChange}
            placeholder="예약자 성함을 입력해주세요."
            value={fields.guestName.value}
          />

          <section aria-labelledby="reservation-guest-count-heading">
            <h2
              className="typo-sub-header-1 text-black"
              id="reservation-guest-count-heading"
            >
              인원
            </h2>
            <div className="mt-1.5">
              {guestCounters.map((counter) => (
                <GuestCounter
                  key={counter.key}
                  label={counter.label}
                  onDecrease={counter.onDecrease}
                  onIncrease={counter.onIncrease}
                  value={counter.value}
                />
              ))}
            </div>
          </section>

          <section aria-labelledby="reservation-date-heading">
            <h2
              className="typo-sub-header-1 mb-5 text-black"
              id="reservation-date-heading"
            >
              날짜
            </h2>
            <Calendar
              isDateDisabled={calendar.isDateDisabled}
              month={calendar.visibleMonth}
              onDateSelect={calendar.onDateSelect}
              onMonthChange={calendar.onMonthChange}
              selectedDate={calendar.selectedDate}
            />
          </section>

          <section aria-labelledby="reservation-time-heading">
            <h2
              className="typo-sub-header-1 mb-5 text-black"
              id="reservation-time-heading"
            >
              시간
            </h2>
            <ReservationTimeSelector
              disabled={timeSelector.disabled}
              onTimeSelect={timeSelector.onTimeSelect}
              selectedTime={timeSelector.selectedTime}
              timeSlots={timeSelector.timeSlots}
            />
          </section>

          <UnderlineTextField
            label="요청사항 (선택)"
            name="requestNote"
            onValueChange={fields.requestNote.onValueChange}
            placeholder="요청사항을 작성해주세요."
            value={fields.requestNote.value}
          />
        </form>
      </div>

      <ReservationBottomBar
        disabled={!submit.canSubmit}
        formId={RESERVATION_FORM_ID}
      />
    </div>
  )
}
