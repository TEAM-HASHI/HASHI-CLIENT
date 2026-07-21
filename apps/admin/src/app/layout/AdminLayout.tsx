import {
  HashiPointMarkIcon,
  HomeIcon,
  MagazineIcon,
  MenuIcon,
  PeopleIcon,
  ReservationIcon,
  TodayRestaurantIcon,
} from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/router/path'
import { authApi } from '@/shared/api/authApi'
import { clearAdminSession, getAdminSession } from '@/shared/auth/adminSession'
import { cn } from '@/shared/utils/cn'

const navigationItems = [
  {
    label: '대시보드',
    to: ROUTES.dashboard,
    icon: <HomeIcon aria-hidden="true" className="size-5" />,
  },
  {
    label: '식당 관리',
    to: ROUTES.restaurants,
    icon: <TodayRestaurantIcon aria-hidden="true" className="size-5" />,
  },
  {
    label: '회원 관리',
    to: ROUTES.users,
    icon: <PeopleIcon aria-hidden="true" className="size-5" />,
  },
  {
    label: '예약 관리',
    to: ROUTES.reservations,
    icon: <ReservationIcon aria-hidden="true" className="size-5" />,
  },
  {
    label: '매거진 관리',
    to: ROUTES.magazines,
    icon: <MagazineIcon aria-hidden="true" className="size-5" />,
  },
]

export const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = getAdminSession()

  const handleLogoutClick = async () => {
    setIsLoggingOut(true)

    try {
      await authApi.logout()
    } finally {
      clearAdminSession()
      queryClient.clear()
      navigate(ROUTES.login, { replace: true })
      setIsLoggingOut(false)
    }
  }

  const handleNavClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="bg-cool-gray-50 min-h-dvh">
      <div className="lg:hidden">
        <header className="border-cool-gray-100 sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4">
          <button
            type="button"
            aria-label="관리자 메뉴 열기"
            className="border-cool-gray-100 text-cool-gray-700 flex size-10 items-center justify-center rounded-md border"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <MenuIcon aria-hidden="true" className="size-5" />
          </button>
          <AdminBrand compact />
          <span className="w-10" aria-hidden="true" />
        </header>
      </div>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/30 lg:hidden',
          isMobileMenuOpen ? 'block' : 'hidden',
        )}
      >
        <button
          aria-label="관리자 메뉴 닫기"
          className="absolute inset-0"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="relative h-full w-[min(18rem,82vw)] bg-white">
          <Sidebar
            adminName={session?.loginId ?? '관리자'}
            isLoggingOut={isLoggingOut}
            onLogoutClick={handleLogoutClick}
            onNavClick={handleNavClick}
          />
        </div>
      </div>

      <aside className="border-cool-gray-100 fixed top-0 bottom-0 left-0 z-20 hidden w-[var(--admin-sidebar-width)] border-r bg-white lg:block">
        <Sidebar
          adminName={session?.loginId ?? '관리자'}
          isLoggingOut={isLoggingOut}
          onLogoutClick={handleLogoutClick}
          onNavClick={handleNavClick}
        />
      </aside>

      <main className="min-h-dvh lg:pl-[var(--admin-sidebar-width)]">
        <Outlet />
      </main>
    </div>
  )
}

const AdminBrand = ({ compact = false }: { compact?: boolean }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-primary-100 text-primary-200 flex size-10 items-center justify-center rounded-lg">
        <HashiPointMarkIcon aria-hidden="true" className="size-7" />
      </span>
      <div className={cn('leading-tight', compact && 'hidden sm:block')}>
        <p className="text-primary-200 text-base font-extrabold">HASHI</p>
        <p className="text-cool-gray-500 text-xs font-bold">Admin Console</p>
      </div>
    </div>
  )
}

const Sidebar = ({
  adminName,
  isLoggingOut,
  onLogoutClick,
  onNavClick,
}: {
  adminName: string
  isLoggingOut: boolean
  onLogoutClick: () => void
  onNavClick: () => void
}) => {
  return (
    <div className="flex h-full flex-col px-5 py-6">
      <AdminBrand />

      <nav className="mt-10 flex flex-col gap-2" aria-label="관리자 메뉴">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                'flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-bold transition',
                isActive
                  ? 'bg-primary-100 text-primary-200'
                  : 'text-cool-gray-600 hover:bg-cool-gray-50 hover:text-cool-gray-900',
              )
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-cool-gray-100 mt-auto border-t pt-5">
        <p className="text-cool-gray-500 text-sm font-semibold">
          {adminName}님 환영합니다.
        </p>
        <Button
          className="mt-3 w-full"
          size="sm"
          variant="neutral"
          loading={isLoggingOut}
          disabled={isLoggingOut}
          onClick={onLogoutClick}
        >
          로그아웃
        </Button>
      </div>
    </div>
  )
}
