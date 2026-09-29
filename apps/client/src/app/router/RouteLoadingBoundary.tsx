import {
  createElement,
  Suspense,
  type ReactNode,
  useEffect,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'

import {
  markRouteLoadingFallbackShown,
  resetRouteLoadingFallbackShown,
  ROUTE_LOADING_DELAY_MS,
} from '@/app/router/routeLoadingPolicy'
import { LoadingScreen } from '@/shared/components/loadingScreen'

const RouteLoadingFallback = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    resetRouteLoadingFallbackShown()

    const timerId = setTimeout(() => {
      markRouteLoadingFallbackShown()
      setIsVisible(true)
    }, ROUTE_LOADING_DELAY_MS)

    return () => {
      clearTimeout(timerId)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return createElement(LoadingScreen)
}

export const RouteLoadingBoundary = ({ children }: { children: ReactNode }) => {
  const location = useLocation()

  useEffect(() => {
    resetRouteLoadingFallbackShown()
  }, [location.key])

  return createElement(
    Suspense,
    { fallback: createElement(RouteLoadingFallback) },
    children,
  )
}

export const SilentRouteLoadingBoundary = ({
  children,
}: {
  children: ReactNode
}) => {
  return createElement(Suspense, { fallback: null }, children)
}
