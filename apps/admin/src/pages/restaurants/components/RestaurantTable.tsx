import type { RestaurantCatalogItem } from '@/pages/restaurants/api/restaurantCatalogApi'
import { ActionButton } from '@/shared/components/ActionButton'
import { AdminTable } from '@/shared/components/AdminTable'

const columns = [
  { key: 'restaurant', label: '식당', className: 'w-[32%]' },
  { key: 'category', label: '분류', className: 'w-[18%]' },
  { key: 'area', label: '지역', className: 'w-[14%]' },
  { key: 'rating', label: '평점', className: 'w-[12%]' },
  { key: 'actions', label: '관리', className: 'w-[24%]' },
]

interface RestaurantTableProps {
  items: RestaurantCatalogItem[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onEdit: (item: RestaurantCatalogItem) => void
  onDelete: (item: RestaurantCatalogItem) => void
}

export const RestaurantTable = ({
  items,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onDelete,
}: RestaurantTableProps) => (
  <AdminTable
    columns={columns}
    isLoading={isLoading}
    isError={isError}
    isEmpty={items.length === 0}
    emptyTitle="공개 중인 식당이 없습니다"
    emptyDescription="필터를 바꾸거나 새 식당을 등록해보세요."
    onRetry={onRetry}
  >
    {items.map((item) => (
      <tr key={item.restaurantId}>
        <td className="px-3 py-3">
          <div className="flex items-center gap-3">
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt=""
                className="size-12 shrink-0 rounded-md object-cover"
              />
            ) : (
              <span className="bg-cool-gray-100 size-12 shrink-0 rounded-md" />
            )}
            <div className="min-w-0">
              <p className="text-cool-gray-900 truncate text-sm font-bold">
                {item.name ?? `식당 #${item.restaurantId}`}
              </p>
              <p className="text-cool-gray-500 mt-0.5 line-clamp-1 text-xs">
                {item.summary ?? '소개 없음'}
              </p>
            </div>
          </div>
        </td>
        <td className="text-cool-gray-600 px-3 py-3 text-sm">
          {item.genre ?? '-'} · {item.foodCategory ?? '-'}
        </td>
        <td className="text-cool-gray-600 px-3 py-3 text-sm">
          {item.area ?? '-'}
        </td>
        <td className="text-cool-gray-600 px-3 py-3 text-sm">
          {item.rating?.toFixed(1) ?? '-'}
        </td>
        <td className="px-3 py-3">
          <div className="flex gap-2">
            <ActionButton onClick={() => onEdit(item)}>수정</ActionButton>
            <ActionButton variant="danger" onClick={() => onDelete(item)}>
              비공개 처리
            </ActionButton>
          </div>
        </td>
      </tr>
    ))}
  </AdminTable>
)
