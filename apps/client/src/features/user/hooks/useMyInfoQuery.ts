import { useQuery } from '@tanstack/react-query'

import { getMyInfo } from '@/features/user/api/getMyInfo'

export const MY_INFO_QUERY_KEY = ['user', 'myInfo'] as const

export const useMyInfoQuery = () => {
  return useQuery({
    queryFn: getMyInfo,
    queryKey: MY_INFO_QUERY_KEY,
  })
}
