import { Button } from '@hashi/hds-ui'

interface SearchErrorStateProps {
  onRetry: () => void
}

export const SearchErrorState = ({ onRetry }: SearchErrorStateProps) => {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="typo-body-4 text-primary-200">
        검색 결과를 불러오지 못했습니다.
      </p>
      <Button onClick={onRetry} size="sm" variant="neutral">
        다시 시도
      </Button>
    </div>
  )
}
