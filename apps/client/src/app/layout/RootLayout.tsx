import { ToastRegion } from '@hashi/hds-ui'
import { useEffect, useRef } from 'react'
import {
  Outlet,
  useLocation,
  useNavigationType,
  useNavigate,
} from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import AsyncBoundary from '@/app/providers/AsyncBoundary'
import { AuthSessionRestoreGate } from '@/app/providers/AuthSessionRestoreGate'
import { trackPageView } from '@/shared/lib/analytics'
import { CollectionTargetQueryDialog } from '@/features/collection/components/CollectionTargetQueryDialog'
import {
  getCollectionSaveRestaurantId,
  getCollectionSaveState,
} from '@/features/collection/utils/collectionNavigation'
import { isValidCollectionId } from '@/features/collection/api/collectionReadContracts'
import { useCollectionSessionVersion } from '@/features/collection/hooks/useCollectionSessionVersion'
import { useAuthStatus } from '@/shared/hooks/useAuthStatus'

const RestaurantCollectionSave = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStatus()
  useCollectionSessionVersion()
  const id = Number(getCollectionSaveRestaurantId(location.state))
  // 지도·컬렉션 화면은 자체 저장창을 소유한다. 상세·메뉴의 저장 진입만 조립한다.
  if (
    !isAuthenticated ||
    !isValidCollectionId(id) ||
    location.pathname === ROUTES.map ||
    location.pathname.startsWith(ROUTES.saved)
  )
    return null
  return (
    <CollectionTargetQueryDialog
      mode="save"
      restaurantId={id}
      onClose={() =>
        navigate(
          { pathname: location.pathname, search: location.search },
          {
            replace: true,
            state: getCollectionSaveState(location.state, null),
          },
        )
      }
    />
  )
}

export const RootLayout = () => {
  const { hash = '', pathname, search = '' } = useLocation()
  const navigationType = useNavigationType()
  const pagePath = `${pathname}${search}${hash}`
  const routeResetKey = `${pathname}${search}`
  const previousPathnameRef = useRef<string | null>(null)

  useEffect(() => {
    const hasPathnameChanged = previousPathnameRef.current !== pathname
    previousPathnameRef.current = pathname
    const shouldPreserveMagazineScroll =
      navigationType === 'POP' && pathname === ROUTES.magazines

    if (!hasPathnameChanged || shouldPreserveMagazineScroll) {
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [navigationType, pathname])

  useEffect(() => {
    trackPageView(pagePath)
  }, [pagePath])

  return (
    <>
      <main className="app-mobile-frame min-h-dvh bg-white">
        <AsyncBoundary resetKeys={[routeResetKey]}>
          <AuthSessionRestoreGate pathname={pathname}>
            <Outlet />
            <RestaurantCollectionSave key={pagePath} />
          </AuthSessionRestoreGate>
        </AsyncBoundary>
      </main>
      <ToastRegion className="z-toast fixed inset-x-0 top-0 mx-auto w-full max-w-[var(--app-mobile-max-width,100%)] px-5 pt-[calc(32px+var(--safe-area-top,0px))]" />
    </>
  )
}
