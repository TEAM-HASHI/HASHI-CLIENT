import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { useMagazineBannersQuery } from '@/features/magazine/hooks/useMagazineBannersQuery'
import { normalizeInstagramUrl } from '@/features/magazine/utils/normalizeInstagramUrl'
import { useMagazinesInfiniteQuery } from '@/pages/magazines/hooks/useMagazinesInfiniteQuery'
import type {
  MagazineHeroBanner,
  RecommendedMagazine,
} from '@/pages/magazines/types'

const MAGAZINE_LIST_PAGE_SIZE = 10

export { normalizeInstagramUrl }

const formatMagazinePublishedDate = (createdAt: string) => {
  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}. ${month}. ${day}.`
}

export const useMagazinesPage = () => {
  const navigate = useNavigate()
  const loadMoreRef = useRef<HTMLLIElement | null>(null)
  const magazineBannersQuery = useMagazineBannersQuery()
  const magazinesQuery = useMagazinesInfiniteQuery({
    size: MAGAZINE_LIST_PAGE_SIZE,
  })
  const canFetchNextPage =
    magazinesQuery.hasNextPage && !magazinesQuery.isFetchingNextPage

  const heroBanners = useMemo<MagazineHeroBanner[]>(() => {
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
  }, [magazineBannersQuery.data?.banners])

  const normalizedRecommendedMagazines = useMemo<RecommendedMagazine[]>(() => {
    return (magazinesQuery.data?.pages ?? []).flatMap((page) =>
      (page.magazines ?? []).flatMap((magazine) => {
        const { bannerImageUrl, createdAt, magazineId, title } = magazine

        if (
          magazineId === undefined ||
          !title ||
          !bannerImageUrl ||
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
          imageUrl: bannerImageUrl,
          publishedDate,
          instagramUrl: normalizeInstagramUrl(
            magazine.instagramRedirectUrl ?? '',
          ),
        }
      }),
    )
  }, [magazinesQuery.data?.pages])

  useEffect(() => {
    if (!canFetchNextPage || typeof IntersectionObserver === 'undefined') {
      return
    }

    const target = loadMoreRef.current

    if (!target) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void magazinesQuery.fetchNextPage()
        }
      },
      {
        root: null,
        rootMargin: '160px 0px',
        threshold: 0,
      },
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [canFetchNextPage, magazinesQuery.fetchNextPage])

  const hasHeroBanners = heroBanners.length > 0
  const hasRecommendedMagazines = normalizedRecommendedMagazines.length > 0
  const isHeroBannerLoading = magazineBannersQuery.isLoading
  const isRecommendedMagazineLoading = magazinesQuery.isLoading
  const isHeroBannerError = magazineBannersQuery.isError
  const isRecommendedMagazineError = magazinesQuery.isError
  const isFetchingNextMagazinePage = magazinesQuery.isFetchingNextPage
  const hasNextMagazinePage = magazinesQuery.hasNextPage

  const handleBackClick = () => {
    navigate(ROUTES.home)
  }

  return {
    handleBackClick,
    hasHeroBanners,
    hasNextMagazinePage,
    hasRecommendedMagazines,
    heroBanners,
    isFetchingNextMagazinePage,
    isHeroBannerError,
    isHeroBannerLoading,
    isRecommendedMagazineError,
    isRecommendedMagazineLoading,
    loadMoreRef,
    refetchHeroBanners: magazineBannersQuery.refetch,
    refetchRecommendedMagazines: magazinesQuery.refetch,
    recommendedMagazines: normalizedRecommendedMagazines,
  }
}
