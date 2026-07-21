import { HashiPickIcon } from '@hashi/hds-icons'

export const ReservationRescueIntro = () => {
  return (
    <section className="bg-cool-gray-900 mx-5 mt-6 rounded-2xl px-5 py-6 text-white">
      <div
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-full bg-white text-5xl"
      >
        <HashiPickIcon />
      </div>
      <p className="typo-caption-2 text-primary-400 mt-5">HASHI PICK</p>
      <h2 className="typo-header-2 mt-2 break-keep">
        예약은 취소됐지만,
        <br />
        맛있는 일정은 계속돼요
      </h2>
      <p className="typo-body-7 text-cool-gray-200 mt-3 break-keep">
        하시가 엄선한 평점 높은 식당을 다시 골라봤어요.
      </p>
    </section>
  )
}
