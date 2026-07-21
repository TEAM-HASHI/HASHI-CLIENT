import { BackIcon, NextIcon } from '@hashi/hds-icons'

type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis'

interface AdminPaginationProps {
  currentPage: number
  totalPages: number
  isDisabled: boolean
  onPageChange: (page: number) => void
}

const MAX_VISIBLE_PAGES = 7

const getPaginationItems = (
  currentPage: number,
  totalPages: number,
): PaginationItem[] => {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index)
  }

  if (currentPage <= 3) {
    return [0, 1, 2, 3, 4, 'end-ellipsis', totalPages - 1]
  }

  if (currentPage >= totalPages - 4) {
    return [
      0,
      'start-ellipsis',
      totalPages - 5,
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
    ]
  }

  return [
    0,
    'start-ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'end-ellipsis',
    totalPages - 1,
  ]
}

const baseButtonClassName =
  'flex size-9 items-center justify-center rounded-md border text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40'

export const AdminPagination = ({
  currentPage,
  totalPages,
  isDisabled,
  onPageChange,
}: AdminPaginationProps) => {
  if (totalPages <= 0) {
    return null
  }

  const items = getPaginationItems(currentPage, totalPages)

  return (
    <nav aria-label="관리자 목록 페이지" className="mt-4 flex justify-center">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="이전 페이지"
          disabled={isDisabled || currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className={`${baseButtonClassName} border-cool-gray-100 text-cool-gray-700 hover:bg-cool-gray-50 bg-white`}
        >
          <BackIcon aria-hidden="true" className="size-4" />
        </button>

        {items.map((item) => {
          if (typeof item !== 'number') {
            return (
              <span
                key={item}
                aria-hidden="true"
                className="text-cool-gray-400 flex size-9 items-center justify-center text-sm"
              >
                …
              </span>
            )
          }

          const isCurrent = item === currentPage

          return (
            <button
              key={item}
              type="button"
              aria-label={`${item + 1}페이지`}
              aria-current={isCurrent ? 'page' : undefined}
              disabled={isDisabled}
              onClick={() => onPageChange(item)}
              className={`${baseButtonClassName} ${
                isCurrent
                  ? 'border-cool-gray-900 bg-cool-gray-900 text-white'
                  : 'border-cool-gray-100 text-cool-gray-700 hover:bg-cool-gray-50 bg-white'
              }`}
            >
              {item + 1}
            </button>
          )
        })}

        <button
          type="button"
          aria-label="다음 페이지"
          disabled={isDisabled || currentPage + 1 >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`${baseButtonClassName} border-cool-gray-100 text-cool-gray-700 hover:bg-cool-gray-50 bg-white`}
        >
          <NextIcon aria-hidden="true" className="size-4" />
        </button>
      </div>
    </nav>
  )
}
