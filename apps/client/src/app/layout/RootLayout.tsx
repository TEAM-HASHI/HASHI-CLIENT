import { ToastRegion } from '@hashi/hds-ui'
import { Outlet } from 'react-router-dom'

export const RootLayout = () => {
  return (
    <>
      <main className="app-mobile-frame min-h-dvh bg-white">
        <Outlet />
      </main>
      <ToastRegion className="z-toast fixed inset-x-0 top-0 mx-auto w-full max-w-[var(--app-mobile-max-width,100%)] px-5 pt-[calc(32px+var(--safe-area-top,0px))]" />
    </>
  )
}
