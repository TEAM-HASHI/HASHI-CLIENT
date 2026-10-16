import { Outlet } from 'react-router-dom'

import { RoutedBottomNavigation } from '@/app/navigation/RoutedBottomNavigation'

export const BottomNavigationLayout = () => (
  <>
    <div className="app-mobile-bottom-nav-layout">
      <Outlet />
    </div>
    <RoutedBottomNavigation className="app-mobile-fixed-bottom" />
  </>
)
