import {
  HomeIcon,
  MapIcon,
  MyIcon,
  MyReservationIcon,
  SaveIcon,
} from '@hashi/hds-icons'
import { BottomNavigation, type BottomNavigationItem } from '@hashi/hds-ui'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'

const bottomNavigationItems = [
  { value: 'home', label: '홈', icon: <HomeIcon /> },
  { value: 'save', label: '저장', icon: <SaveIcon /> },
  { value: 'map', label: '지도', icon: <MapIcon /> },
  {
    value: 'myReservations',
    label: '내 예약',
    icon: <MyReservationIcon />,
  },
  { value: 'mypage', label: '마이', icon: <MyIcon /> },
] satisfies BottomNavigationItem[]

const bottomNavigationPath = {
  home: ROUTES.home,
  save: ROUTES.saved,
  map: ROUTES.map,
  myReservations: ROUTES.myReservations,
  mypage: ROUTES.mypage,
} as const

type BottomNavigationValue = (typeof bottomNavigationItems)[number]['value']

const getBottomNavigationValue = (pathname: string): BottomNavigationValue => {
  if (pathname === ROUTES.myReservations) {
    return 'myReservations'
  }

  if (pathname === ROUTES.saved) {
    return 'save'
  }

  if (pathname === ROUTES.map) {
    return 'map'
  }

  if (pathname === ROUTES.mypage) {
    return 'mypage'
  }

  return 'home'
}

export const BottomNavigationLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <>
      <div className="min-h-dvh pb-[calc(84px+var(--safe-area-bottom,0px))]">
        <Outlet />
      </div>
      <BottomNavigation
        className="app-mobile-fixed-bottom"
        items={bottomNavigationItems}
        onValueChange={(value) => {
          if (value in bottomNavigationPath) {
            navigate(
              bottomNavigationPath[value as keyof typeof bottomNavigationPath],
            )
          }
        }}
        value={getBottomNavigationValue(location.pathname)}
      />
    </>
  )
}
