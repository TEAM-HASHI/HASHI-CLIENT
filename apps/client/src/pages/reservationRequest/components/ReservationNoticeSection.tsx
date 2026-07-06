const RESERVATION_NOTICE_ITEMS = [
  '예약 확정 후 안내된 기한 내 입금이 확인되지 않을 경우 예약이 자동 취소될 수 있습니다.',
  '예약 확정 전 취소 요청 시에는 수수료가 부과되지 않으며, 포인트도 차감되지 않습니다.',
  '입금 완료 후 취소는 가능하지만, 결제한 수수료와 사용한 포인트는 환불되지 않습니다.',
  '예약이 불가한 경우에는 별도의 비용이 발생하지 않으며, 고객님의 취향과 예약 조건을 고려한 대체 식당을 함께 안내해드립니다.',
  '식당 사정으로 예약이 취소될 경우 결제한 수수료와 사용한 포인트를 전액 환불해드립니다.',
]

export const ReservationNoticeSection = () => {
  return (
    <section
      aria-labelledby="reservation-notice-heading"
      className="text-warm-gray-300 typo-caption-2 px-8 pt-[45px] leading-[1.5]"
    >
      <h2 className="font-normal" id="reservation-notice-heading">
        예약 안내
      </h2>
      <p className="mt-1.5">
        결제는 예약이 확정된 경우에만 계좌이체 방식으로 진행됩니다.
        <br />
        예약 결과는 카카오톡으로 안내드리며, 예약이 확정된 경우 입금 계좌를
        함께 보내드립니다.
      </p>
      <ul className="mt-[22px] list-disc space-y-1 pl-[18px]">
        {RESERVATION_NOTICE_ITEMS.map((noticeItem) => (
          <li key={noticeItem}>{noticeItem}</li>
        ))}
      </ul>
    </section>
  )
}
