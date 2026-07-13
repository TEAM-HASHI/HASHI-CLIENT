import { queryOptions } from '@tanstack/react-query'

import { getMagazineBanners } from '@/features/magazine/api/getMagazineBanners'
import { magazineQueryKeys } from '@/features/magazine/queries/magazineQueryKeys'

export const magazineBannerQueryOptions = () =>
  queryOptions({
    queryKey: magazineQueryKeys.banners(),
    queryFn: getMagazineBanners,
  })
