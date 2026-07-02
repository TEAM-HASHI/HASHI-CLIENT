import { Outlet } from 'react-router-dom'

export const RootLayout = () => {
  return (
    <main className="app-mobile-frame min-h-dvh bg-white">
      <Outlet />
    </main>
  )
}
