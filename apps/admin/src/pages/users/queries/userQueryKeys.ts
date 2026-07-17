import type { ListAdminUsersQuery } from '@/pages/users/api/getAdminUsers'

export const userQueryKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (params: ListAdminUsersQuery) =>
    [...userQueryKeys.lists(), params] as const,
}
