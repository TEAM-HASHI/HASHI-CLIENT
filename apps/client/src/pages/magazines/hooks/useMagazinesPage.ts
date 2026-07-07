import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  magazineHeroBanners,
  recommendedMagazines,
} from '@/pages/magazines/mocks/magazines.mock'

const checkIsInstagramHostname = (hostname: string) => {
  return hostname === 'instagram.com' || hostname.endsWith('.instagram.com')
}

export const normalizeInstagramUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url)
    const isValidProtocol =
      parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:'

    if (!isValidProtocol || !checkIsInstagramHostname(parsedUrl.hostname)) {
      return null
    }

    return parsedUrl.toString()
  } catch {
    return null
  }
}

export const useMagazinesPage = () => {
  const navigate = useNavigate()
  const heroBanners = [...magazineHeroBanners]
    .sort(
      (currentBanner, nextBanner) =>
        currentBanner.displayOrder - nextBanner.displayOrder,
    )
    .map((banner) => ({
      ...banner,
      instagramUrl: normalizeInstagramUrl(banner.instagramUrl ?? ''),
    }))
  const normalizedRecommendedMagazines = recommendedMagazines.map(
    (magazine) => ({
      ...magazine,
      instagramUrl: normalizeInstagramUrl(magazine.instagramUrl ?? ''),
    }),
  )
  const hasHeroBanners = heroBanners.length > 0
  const hasRecommendedMagazines = normalizedRecommendedMagazines.length > 0

  const handleBackClick = () => {
    navigate(ROUTES.home)
  }

  return {
    heroBanners,
    recommendedMagazines: normalizedRecommendedMagazines,
    hasHeroBanners,
    hasRecommendedMagazines,
    handleBackClick,
  }
}
