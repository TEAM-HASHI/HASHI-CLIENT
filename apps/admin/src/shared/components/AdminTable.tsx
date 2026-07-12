import type { ReactNode } from 'react'
import { Button } from '@hashi/hds-ui'
import { cn } from '@/shared/utils/cn'

export interface AdminTableColumn {
  key: string
  label: string
  className?: string
}

interface AdminTableProps {
  columns: AdminTableColumn[]
  children: ReactNode
  isLoading?: boolean
  isError?: boolean
  isEmpty?: boolean
  emptyTitle: string
  emptyDescription: string
  onRetry?: () => void
}

export const AdminTable = ({
  columns,
  children,
  isLoading = false,
  isError = false,
  isEmpty = false,
  emptyTitle,
  emptyDescription,
  onRetry,
}: AdminTableProps) => {
  const colSpan = columns.length

  return (
    <div className="min-h-0 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'border-cool-gray-100 bg-cool-gray-50 text-cool-gray-500 sticky top-0 z-10 border-b px-3 py-3 text-xs font-bold',
                    column.className,
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-cool-gray-100 divide-y">
            {isLoading ? <TableLoadingRows columns={columns} /> : null}
            {!isLoading && isError ? (
              <TableStateRow colSpan={colSpan}>
                <p className="text-cool-gray-900 text-base font-bold">
                  데이터를 불러오지 못했습니다
                </p>
                <p className="text-cool-gray-500 mt-1 text-sm">
                  서버 응답을 확인하지 못했습니다. 잠시 후 다시 시도해주세요.
                </p>
                {onRetry ? (
                  <Button
                    className="mt-4"
                    size="sm"
                    variant="neutral"
                    onClick={onRetry}
                  >
                    다시 시도
                  </Button>
                ) : null}
              </TableStateRow>
            ) : null}
            {!isLoading && !isError && isEmpty ? (
              <TableStateRow colSpan={colSpan}>
                <p className="text-cool-gray-900 text-base font-bold">
                  {emptyTitle}
                </p>
                <p className="text-cool-gray-500 mt-1 text-sm">
                  {emptyDescription}
                </p>
              </TableStateRow>
            ) : null}
            {!isLoading && !isError && !isEmpty ? children : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const TableLoadingRows = ({ columns }: { columns: AdminTableColumn[] }) => {
  return Array.from({ length: 6 }, (_, rowIndex) => (
    <tr key={rowIndex}>
      {columns.map((column) => (
        <td key={column.key} className="px-3 py-4">
          <span className="bg-cool-gray-100 block h-4 w-full animate-pulse rounded" />
        </td>
      ))}
    </tr>
  ))
}

const TableStateRow = ({
  colSpan,
  children,
}: {
  colSpan: number
  children: ReactNode
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-16 text-center">
        {children}
      </td>
    </tr>
  )
}
