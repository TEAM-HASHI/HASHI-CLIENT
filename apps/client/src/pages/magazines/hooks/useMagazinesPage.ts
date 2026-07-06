import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  magazineHeroBanners,
  recommendedMagazines,
} from '@/pages/magazines/mocks/magazines.mock'

export const useMagazinesPage = () => {
  const navigate = useNavigate()
  const heroBanners = [...magazineHeroBanners].sort(
    (currentBanner, nextBanner) =>
      currentBanner.displayOrder - nextBanner.displayOrder,
  )
  const hasHeroBanners = heroBanners.length > 0
  const hasRecommendedMagazines = recommendedMagazines.length > 0

  const handleBackClick = () => {
    navigate(ROUTES.home)
  }

  return {
    heroBanners,
    recommendedMagazines,
    hasHeroBanners,
    hasRecommendedMagazines,
    handleBackClick,
  }
}
