import { request } from '@/shared/api/request'

export type AdminUserSort = 'NICKNAME' | 'CREATED_AT'

export interface ListAdminUsersQuery {
  sort: AdminUserSort
  keyword?: string
  page: number
  size: number
}

export interface AdminUser {
  userId: number
  nickname: string
  nameEng: string | null
  birthDate: string
  phone: string
  email: string
  profileImageUrl: string | null
  createdAt: string
}

export interface AdminUserListData {
  users: AdminUser[]
  page: number
  size: number
  totalCount: number
  totalPages: number
}

export const getAdminUsers = (params: ListAdminUsersQuery) => {
  const keyword = params.keyword?.trim()

  return request<AdminUserListData>('/api/v1/admin/users', {
    searchParams: {
      sort: params.sort,
      ...(keyword ? { keyword } : {}),
      page: params.page,
      size: params.size,
    },
  })
}
