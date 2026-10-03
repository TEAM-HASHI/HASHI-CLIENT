import { useEffect, useMemo } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { magazineBannerQueryOptions } from '@/features/magazine/queries/magazineBannerQueryOptions'
import { normalizeInstagramUrl } from '@/features/magazine/utils/normalizeInstagramUrl'
import { magazineListInfiniteQueryOptions } from '@/pages/magazines/queries/magazineListQueryOptions'
import { useMagazineListRestoration } from '@/pages/magazines/hooks/useMagazineListRestoration'
import type {
  MagazineHeroBanner,
  RecommendedMagazine,
} from '@/pages/magazines/types'
import { useInfiniteScrollTrigger } from '@/shared/hooks'

const MAGAZINE_LIST_PAGE_SIZE = 10

export { normalizeInstagramUrl }

const formatMagazinePublishedDate = (createdAt: string) => {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})/.exec(createdAt)

  if (!dateParts) {
    return null
  }

  const [, year, month, day] = dateParts

  return `${year}. ${month}.${day}.`
}

export const useMagazinesPage = () => {
  const navigate = useNavigate()
  const magazineBannersQuery = useQuery({
    ...magazineBannerQueryOptions(),
    throwOnError: false,
  })
  const magazinesQuery = useInfiniteQuery(
    magazineListInfiniteQueryOptions({ size: MAGAZINE_LIST_PAGE_SIZE }),
  )
  const { fetchNextPage } = magazinesQuery
  const isRestoring = useMagazineListRestoration({
    pageCount: magazinesQuery.data?.pages.length ?? 0,
    hasNextPage: Boolean(magazinesQuery.hasNextPage),
    isFetching: magazinesQuery.isFetching || magazineBannersQuery.isPending,
    isError: magazinesQuery.isError,
    fetchNextPage,
  })
  const canFetchNextPage =
    magazinesQuery.hasNextPage &&
    !magazinesQuery.isFetching &&
    !magazinesQuery.isError &&
    !isRestoring
  const loadMoreRef = useInfiniteScrollTrigger<HTMLLIElement>({
    enabled: Boolean(canFetchNextPage),
    isLoading: magazinesQuery.isFetchingNextPage,
    onIntersect: fetchNextPage,
  })

  const heroBanners = useMemo<MagazineHeroBanner[]>(() => {
    if (magazineBannersQuery.isError) {
      return []
    }

    return (magazineBannersQuery.data?.banners ?? []).flatMap((banner) => {
      const { bannerImageUrl, magazineId, title } = banner

      if (magazineId === undefined || !bannerImageUrl) {
        return []
      }

      const accessibilityLabel = title || '매거진 배너'

      return {
        id: String(magazineId),
        imageUrl: bannerImageUrl,
        instagramUrl: normalizeInstagramUrl(banner.instagramRedirectUrl ?? ''),
        accessibilityLabel,
      }
    })
  }, [magazineBannersQuery.data?.banners, magazineBannersQuery.isError])

  const normalizedRecommendedMagazines = useMemo<RecommendedMagazine[]>(() => {
    return (magazinesQuery.data?.pages ?? []).flatMap((page) =>
      (page.magazines ?? []).flatMap((magazine) => {
        const { createdAt, magazineId, thumbnailImageUrl, title } = magazine

        if (
          magazineId === undefined ||
          !title ||
          !thumbnailImageUrl ||
          !createdAt
        ) {
          return []
        }

        const publishedDate = formatMagazinePublishedDate(createdAt)

        if (!publishedDate) {
          return []
        }

        return {
          id: String(magazineId),
          title,
          imageUrl: thumbnailImageUrl,
          publishedDate,
          instagramUrl: normalizeInstagramUrl(
            magazine.instagramRedirectUrl ?? '',
          ),
        }
      }),
    )
  }, [magazinesQuery.data?.pages])

  useEffect(() => {
    if (normalizedRecommendedMagazines.length > 0 || !canFetchNextPage) {
      return
    }

    void fetchNextPage({ cancelRefetch: false })
  }, [canFetchNextPage, fetchNextPage, normalizedRecommendedMagazines.length])

  const isHeroBannerLoading = magazineBannersQuery.isLoading
  const isRecommendedMagazineLoading = magazinesQuery.isLoading
  const isRecommendedMagazineError = magazinesQuery.isLoadingError
  const isNextMagazinePageError = magazinesQuery.isFetchNextPageError
  const isFetchingNextMagazinePage = magazinesQuery.isFetchingNextPage
  const hasNextMagazinePage = magazinesQuery.hasNextPage

  const handleBackClick = () => {
    navigate(ROUTES.home)
  }

  return {
    handleBackClick,
    hasNextMagazinePage,
    heroBanners,
    isFetchingNextMagazinePage,
    isHeroBannerLoading,
    isRecommendedMagazineError,
    isNextMagazinePageError,
    isRecommendedMagazineLoading,
    loadMoreRef,
    refetchRecommendedMagazines: magazinesQuery.refetch,
    retryNextMagazinePage: fetchNextPage,
    recommendedMagazines: normalizedRecommendedMagazines,
  }
}
