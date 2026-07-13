import { useQuery } from '@tanstack/react-query'

import { getMyProfileSummary } from '@/features/user/api/getMyProfileSummary'

export const MY_PROFILE_SUMMARY_QUERY_KEY = [
  'user',
  'myProfileSummary',
] as const

export const useMyProfileSummaryQuery = () => {
  return useQuery({
    queryFn: getMyProfileSummary,
    queryKey: MY_PROFILE_SUMMARY_QUERY_KEY,
  })
}
