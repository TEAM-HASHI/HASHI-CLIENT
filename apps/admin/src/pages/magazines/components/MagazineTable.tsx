import type { MagazineCatalogItem } from '@/pages/magazines/api/magazineCatalogApi'
import { ActionButton } from '@/shared/components/ActionButton'
import { AdminTable } from '@/shared/components/AdminTable'

const columns = [
  { key: 'banner', label: '배너', className: 'w-[18%]' },
  { key: 'title', label: '제목', className: 'w-[30%]' },
  { key: 'url', label: 'Instagram', className: 'w-[26%]' },
  { key: 'createdAt', label: '등록일', className: 'w-[12%]' },
  { key: 'actions', label: '관리', className: 'w-[14%]' },
]

export const MagazineTable = ({
  items,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onDelete,
}: {
  items: MagazineCatalogItem[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onEdit: (item: MagazineCatalogItem) => void
  onDelete: (item: MagazineCatalogItem) => void
}) => (
  <AdminTable
    columns={columns}
    isLoading={isLoading}
    isError={isError}
    isEmpty={items.length === 0}
    emptyTitle="공개 중인 매거진이 없습니다"
    emptyDescription="새 매거진을 등록해보세요."
    onRetry={onRetry}
  >
    {items.map((item) => (
      <tr key={item.magazineId}>
        <td className="px-3 py-3">
          {item.bannerImageUrl ? (
            <img
              src={item.bannerImageUrl}
              alt=""
              className="h-14 w-24 rounded-md object-cover"
            />
          ) : (
            <span className="bg-cool-gray-100 block h-14 w-24 rounded-md" />
          )}
        </td>
        <td className="text-cool-gray-900 px-3 py-3 text-sm font-bold">
          {item.title ?? `매거진 #${item.magazineId}`}
        </td>
        <td className="px-3 py-3">
          <a
            href={item.instagramRedirectUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary-200 block truncate text-sm underline"
          >
            {item.instagramRedirectUrl ?? '-'}
          </a>
        </td>
        <td className="text-cool-gray-500 px-3 py-3 text-xs">
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('ko-KR')
            : '-'}
        </td>
        <td className="px-3 py-3">
          <div className="flex gap-2">
            <ActionButton onClick={() => onEdit(item)}>수정</ActionButton>
            <ActionButton variant="danger" onClick={() => onDelete(item)}>
              삭제
            </ActionButton>
          </div>
        </td>
      </tr>
    ))}
  </AdminTable>
)
