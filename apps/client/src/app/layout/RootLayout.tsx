import { ToastRegion } from '@hashi/hds-ui'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import AsyncBoundary from '@/app/providers/AsyncBoundary'
import { AuthSessionRestoreGate } from '@/app/providers/AuthSessionRestoreGate'
import { trackPageView } from '@/shared/lib/analytics'

export const RootLayout = () => {
  const { hash = '', pathname, search = '' } = useLocation()
  const pagePath = `${pathname}${search}${hash}`
  const routeResetKey = `${pathname}${search}`

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  useEffect(() => {
    trackPageView(pagePath)
  }, [pagePath])

  return (
    <>
      <main className="app-mobile-frame min-h-dvh bg-white">
        <AsyncBoundary resetKeys={[routeResetKey]}>
          <AuthSessionRestoreGate pathname={pathname}>
            <Outlet />
          </AuthSessionRestoreGate>
        </AsyncBoundary>
      </main>
      <ToastRegion className="z-toast fixed inset-x-0 top-0 mx-auto w-full max-w-[var(--app-mobile-max-width,100%)] px-5 pt-[calc(32px+var(--safe-area-top,0px))]" />
    </>
  )
}
