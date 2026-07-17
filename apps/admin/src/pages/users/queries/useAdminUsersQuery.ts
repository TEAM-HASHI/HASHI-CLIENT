import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  getAdminUsers,
  type ListAdminUsersQuery,
} from '@/pages/users/api/getAdminUsers'
import { userQueryKeys } from '@/pages/users/queries/userQueryKeys'

export const useAdminUsersQuery = (params: ListAdminUsersQuery) =>
  useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => getAdminUsers(params),
    queryKey: userQueryKeys.list(params),
  })
