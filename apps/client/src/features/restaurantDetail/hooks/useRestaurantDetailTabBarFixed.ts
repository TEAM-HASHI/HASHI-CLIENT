import { useEffect, useRef, useState } from 'react'

import { RESTAURANT_DETAIL_HEADER_HEIGHT } from '@/features/restaurantDetail/constants/restaurantDetailLayout'

export const useRestaurantDetailTabBarFixed = () => {
  const markerRef = useRef<HTMLDivElement>(null)
  const [isTabBarFixed, setIsTabBarFixed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const marker = markerRef.current

      if (!marker) {
        return
      }

      setIsTabBarFixed(
        marker.getBoundingClientRect().top <= RESTAURANT_DETAIL_HEADER_HEIGHT,
      )
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return {
    isTabBarFixed,
    markerRef,
  }
}
