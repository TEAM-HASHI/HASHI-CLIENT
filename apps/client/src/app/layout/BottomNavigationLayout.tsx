import {
  HomeIcon,
  MapIcon,
  MyIcon,
  MyReservationIcon,
  SaveIcon,
} from '@hashi/hds-icons'
import { BottomNavigation, type BottomNavigationItem } from '@hashi/hds-ui'
import { matchPath, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { isCollectionMapState } from '@/pages/saved/utils/collectionMapState'

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

type LoginRequiredLocationState = {
  from?: {
    pathname?: string
  }
}

const getBottomNavigationValue = (
  pathname: string,
  fallbackPathname?: string,
): BottomNavigationValue | undefined => {
  const targetPathname =
    pathname === ROUTES.loginRequired && fallbackPathname
      ? fallbackPathname
      : pathname

  if (targetPathname === ROUTES.myReservations) {
    return 'myReservations'
  }

  if (
    targetPathname === ROUTES.saved ||
    matchPath(ROUTES.collectionDetail, targetPathname)
  ) {
    return 'save'
  }

  if (targetPathname === ROUTES.map) {
    return 'map'
  }

  if (
    targetPathname === ROUTES.mypage ||
    matchPath({ path: ROUTES.notices, end: false }, targetPathname) ||
    matchPath({ path: ROUTES.terms, end: false }, targetPathname)
  ) {
    return 'mypage'
  }

  if (targetPathname === ROUTES.home) {
    return 'home'
  }

  return undefined
}

export const BottomNavigationLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const loginRequiredState = location.state as LoginRequiredLocationState | null

  return (
    <>
      <div className="app-mobile-bottom-nav-layout">
        <Outlet />
      </div>
      <BottomNavigation
        onClick={(event) => {
          if (
            location.pathname === ROUTES.map &&
            event.target instanceof Element &&
            event.target.closest('button[aria-current="page"]')
          ) {
            navigate(ROUTES.map, { replace: true, state: { resetMap: true } })
          }
        }}
        className="app-mobile-fixed-bottom"
        items={bottomNavigationItems}
        onValueChange={(value) => {
          if (value in bottomNavigationPath) {
            navigate(
              bottomNavigationPath[value as keyof typeof bottomNavigationPath],
            )
          }
        }}
        value={getBottomNavigationValue(
          location.pathname === ROUTES.map &&
            isCollectionMapState(location.state)
            ? ROUTES.saved
            : location.pathname,
          loginRequiredState?.from?.pathname,
        )}
      />
    </>
  )
}
