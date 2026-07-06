export type ReservationNoticeSectionProps = {
  notices: readonly string[]
}

export const ReservationNoticeSection = ({
  notices,
}: ReservationNoticeSectionProps) => {
  return (
    <section className="border-warm-gray-50 border-t-8 px-5 pt-5 pb-10">
      <ul className="typo-caption-2 text-warm-gray-300 list-disc space-y-1.5 pl-5">
        {notices.map((notice) => (
          <li key={notice}>{notice}</li>
        ))}
      </ul>
    </section>
  )
}
