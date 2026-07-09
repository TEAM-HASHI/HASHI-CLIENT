import { ToastRegion } from '@hashi/hds-ui'
import { Outlet } from 'react-router-dom'

export const RootLayout = () => {
  return (
    <>
      <main className="app-mobile-frame min-h-dvh bg-white">
        <Outlet />
      </main>
      <ToastRegion className="z-toast fixed inset-x-0 bottom-[calc(92px+var(--safe-area-bottom,0px))] mx-auto w-[353px] max-w-[calc(100%-40px)]" />
    </>
  )
}
