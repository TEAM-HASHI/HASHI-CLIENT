import { CheckIcon } from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'

interface AnywhereReservationCtaProps {
  onReservationPress: () => void
}

export const AnywhereReservationCta = ({
  onReservationPress,
}: AnywhereReservationCtaProps) => {
  return (
    <section className="bg-cool-gray-800 mt-7 flex items-center justify-between rounded-[10px] py-[18px] pr-[18px] pl-[14px]">
      <div className="flex min-w-0 items-center gap-2.75">
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
        onClick={onReservationPress}
        type="button"
      >
        예약하기
      </Button>
    </section>
  )
}
