import type { AdminUser } from '@/pages/users/api/getAdminUsers'
import {
  AdminTable,
  type AdminTableColumn,
} from '@/shared/components/AdminTable'

const tableColumns: AdminTableColumn[] = [
  { key: 'profile', label: '프로필', className: 'w-20' },
  { key: 'nickname', label: '닉네임', className: 'w-36' },
  { key: 'nameEng', label: '영문 이름', className: 'w-36' },
  { key: 'birthDate', label: '생년월일', className: 'w-32' },
  { key: 'phone', label: '전화번호', className: 'w-36' },
  { key: 'email', label: '이메일', className: 'w-64' },
  { key: 'createdAt', label: '가입일', className: 'w-44' },
]

interface UserTableProps {
  users: AdminUser[]
  isLoading: boolean
  isError: boolean
  emptyTitle: string
  emptyDescription: string
  onRetry: () => void
}

const formatCreatedAt = (value: string) =>
  value ? value.replace('T', ' ').slice(0, 16) : '-'

export const UserTable = ({
  users,
  isLoading,
  isError,
  emptyTitle,
  emptyDescription,
  onRetry,
}: UserTableProps) => {
  return (
    <div className="border-cool-gray-100 overflow-hidden rounded-lg border">
      <AdminTable
        columns={tableColumns}
        tableClassName="w-full min-w-[72rem]"
        isLoading={isLoading}
        isError={isError}
        isEmpty={users.length === 0}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        onRetry={onRetry}
      >
        {users.map((user) => (
          <tr key={user.userId} className="hover:bg-cool-gray-50">
            <td className="px-3 py-3">
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={`${user.nickname} 프로필`}
                  className="bg-cool-gray-100 size-10 rounded-full object-cover"
                />
              ) : (
                <span
                  role="img"
                  aria-label={`${user.nickname} 프로필 이미지 없음`}
                  className="bg-primary-100 text-primary-200 flex size-10 items-center justify-center rounded-full text-sm font-extrabold"
                >
                  {user.nickname.slice(0, 1)}
                </span>
              )}
            </td>
            <td className="text-cool-gray-900 px-3 py-3 text-sm font-bold whitespace-nowrap">
              {user.nickname}
            </td>
            <td className="text-cool-gray-600 px-3 py-3 text-sm whitespace-nowrap">
              {user.nameEng ?? '-'}
            </td>
            <td className="text-cool-gray-600 px-3 py-3 text-sm whitespace-nowrap">
              {user.birthDate}
            </td>
            <td className="text-cool-gray-600 px-3 py-3 text-sm whitespace-nowrap">
              {user.phone}
            </td>
            <td className="text-cool-gray-700 px-3 py-3 text-sm">
              <span className="block truncate" title={user.email}>
                {user.email}
              </span>
            </td>
            <td className="text-cool-gray-600 px-3 py-3 text-sm whitespace-nowrap">
              {formatCreatedAt(user.createdAt)}
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  )
}
