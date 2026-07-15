import * as Sentry from '@sentry/react'
import type { ReactNode } from 'react'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LinksFunction,
  type MetaFunction,
} from 'react-router'

import { AuthSessionRestoreGate } from '@/app/providers/AuthSessionRestoreGate'
import QueryProvider from '@/app/providers/QueryProvider'
import '@/app/styles/global.css'
import { LoadingScreen } from '@/shared/components/loadingScreen'

const DEFAULT_DESCRIPTION =
  '한국인 여행자를 위한 일본 맛집 큐레이션 및 예약 서비스'

export const links: LinksFunction = () => [
  { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  {
    rel: 'apple-touch-icon',
    href: '/icons/apple-touch-icon-180x180.png',
    sizes: '180x180',
  },
]

export const meta: MetaFunction = () => [
  { title: 'HASHI - 발견부터 예약까지' },
  { name: 'description', content: DEFAULT_DESCRIPTION },
]

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
          name="viewport"
        />
        <meta content="#273033" name="theme-color" />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="default" name="apple-mobile-web-app-status-bar-style" />
        <meta content="HASHI" name="apple-mobile-web-app-title" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export const HydrateFallback = () => {
  return <LoadingScreen />
}

const App = () => {
  return (
    <Sentry.ErrorBoundary fallback={<p>문제가 발생했습니다.</p>}>
      <QueryProvider>
        <AuthSessionRestoreGate>
          <Outlet />
        </AuthSessionRestoreGate>
      </QueryProvider>
    </Sentry.ErrorBoundary>
  )
}

export default App
