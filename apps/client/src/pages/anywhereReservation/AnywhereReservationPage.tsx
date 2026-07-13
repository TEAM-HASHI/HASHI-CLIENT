import { BackIcon } from '@hashi/hds-icons'
import { Calendar, Header, IconButton } from '@hashi/hds-ui'
import type { SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  GuestCounter,
  ReservationBottomBar,
  ReservationRequestNoteField,
  ReservationTimeSelector,
  ReservationUnderlineTextField,
} from '@/features/reservation/components'
import { useAnywhereReservationForm } from '@/pages/anywhereReservation/hooks/useAnywhereReservationForm'

const ANYWHERE_RESERVATION_FORM_ID = 'anywhere-reservation-form'

export const AnywhereReservationPage = () => {
  const navigate = useNavigate()
  const { calendar, fields, guestCounters, submit, timeSelector } =
    useAnywhereReservationForm()

  const handleBackClick = () => {
    navigate(-1)
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    const anywhereReservationDraft = submit.createAnywhereReservationDraft()

    if (!anywhereReservationDraft) {
      return
    }

    navigate(ROUTES.reservationRequest, {
      state: anywhereReservationDraft,
    })
  }

  return (
    <div className="min-h-dvh bg-white pt-18.75 pb-[128px]">
      <Header
        className="app-mobile-fixed-top z-fixed fixed"
        leftAction={
          <IconButton aria-label="뒤로가기" onClick={handleBackClick} size="xs">
            <BackIcon className="size-6" />
          </IconButton>
        }
        title="예약하기"
      />

      <div className="px-6 pt-6.5">
        <form
          className="flex flex-col gap-13.75"
          id={ANYWHERE_RESERVATION_FORM_ID}
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-8.75">
            <ReservationUnderlineTextField
              label="식당명"
              name="restaurantName"
              onValueChange={fields.restaurantName.onValueChange}
              placeholder="식당명을 입력해주세요."
              value={fields.restaurantName.value}
            />
            <ReservationUnderlineTextField
              label="식당 주소"
              name="restaurantAddress"
              onValueChange={fields.restaurantAddress.onValueChange}
              placeholder="식당 주소를 입력해주세요."
              value={fields.restaurantAddress.value}
            />
            <ReservationUnderlineTextField
              autoComplete="name"
              label="예약자명"
              name="guestName"
              onValueChange={fields.guestName.onValueChange}
              placeholder="예약자 성함을 입력해주세요."
              value={fields.guestName.value}
            />
          </div>

          <section aria-labelledby="anywhere-reservation-guest-count-heading">
            <h2
              className="typo-sub-header-1 text-black"
              id="anywhere-reservation-guest-count-heading"
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

          <section aria-labelledby="anywhere-reservation-date-heading">
            <h2
              className="typo-sub-header-1 mb-5 text-black"
              id="anywhere-reservation-date-heading"
            >
              날짜
            </h2>
            <Calendar
              isDateDisabled={calendar.isDateDisabled}
              minMonth={calendar.minMonth}
              month={calendar.visibleMonth}
              onDateSelect={calendar.onDateSelect}
              onMonthChange={calendar.onMonthChange}
              selectedDate={calendar.selectedDate}
            />
          </section>

          <section aria-labelledby="anywhere-reservation-time-heading">
            <h2
              className="typo-sub-header-1 mb-5 text-black"
              id="anywhere-reservation-time-heading"
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

          <ReservationRequestNoteField
            onValueChange={fields.requestNote.onValueChange}
            value={fields.requestNote.value}
          />
        </form>
      </div>

      <ReservationBottomBar
        disabled={!submit.canSubmit}
        formId={ANYWHERE_RESERVATION_FORM_ID}
      />
    </div>
  )
}
