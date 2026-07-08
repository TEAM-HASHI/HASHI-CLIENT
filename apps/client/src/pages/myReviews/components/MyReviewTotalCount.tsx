interface MyReviewTotalCountProps {
  count: number
}

export const MyReviewTotalCount = ({ count }: MyReviewTotalCountProps) => {
  return (
    <p className="typo-body-2 text-primary-200 py-5">
      총 <strong className="typo-sub-header-1">{count}</strong>건
    </p>
  )
}
