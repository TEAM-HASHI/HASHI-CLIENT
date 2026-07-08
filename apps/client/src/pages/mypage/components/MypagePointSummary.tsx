type MypagePointSummaryProps = {
  point: number
}

const formatPoint = (point: number) => {
  return `${point.toLocaleString('ko-KR')} P`
}

export const MypagePointSummary = ({ point }: MypagePointSummaryProps) => {
  return (
    <section
      aria-label="사용 가능 포인트"
      className="mb-4.5 ml-1.5 flex flex-col gap-1.25"
    >
      <p className="typo-sub-header-2 text-warm-gray-300">사용 가능 포인트</p>
      <p className="typo-header-1 text-black">{formatPoint(point)}</p>
    </section>
  )
}
