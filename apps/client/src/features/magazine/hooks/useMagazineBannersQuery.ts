import { useQuery } from '@tanstack/react-query'

import { magazineBannerQueryOptions } from '@/features/magazine/queries/magazineBannerQueryOptions'

export const useMagazineBannersQuery = () => {
  return useQuery(magazineBannerQueryOptions())
}
