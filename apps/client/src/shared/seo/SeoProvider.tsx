import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

import { getRouteSeoFallback } from '@/shared/seo/routePolicy'
import { applySeoPage } from '@/shared/seo/seoHead'
import {
  SeoRegistrationContext,
  type SeoRegistration,
} from '@/shared/seo/SeoRegistrationContext'

const SEO_ATTRIBUTE = 'data-hashi-seo'

const hasMatchingInitialPrerenderedSeo = (pathname: string) => {
  const robots = document.head.querySelector<HTMLMetaElement>(
    `meta[name="robots"][${SEO_ATTRIBUTE}]`,
  )
  const canonical = document.head.querySelector<HTMLLinkElement>(
    `link[rel="canonical"][${SEO_ATTRIBUTE}]`,
  )

  if (robots?.content !== 'index, follow' || !canonical?.href) {
    return false
  }

  try {
    return new URL(canonical.href).pathname === pathname
  } catch {
    return false
  }
}

interface SeoProviderProps {
  children: ReactNode
}

export const SeoProvider = ({ children }: SeoProviderProps) => {
  const { pathname } = useLocation()
  const initialPathname = useRef(pathname)
  const shouldPreserveInitialSeo = useRef(
    hasMatchingInitialPrerenderedSeo(pathname),
  )
  const [registration, setRegistration] = useState<SeoRegistration | null>(null)
  const registerPage = useCallback((nextRegistration: SeoRegistration) => {
    setRegistration(nextRegistration)

    return () => {
      setRegistration((currentRegistration) =>
        currentRegistration?.id === nextRegistration.id
          ? null
          : currentRegistration,
      )
    }
  }, [])
  const fallbackPage = useMemo(() => getRouteSeoFallback(pathname), [pathname])
  const activePage =
    registration?.pathname === pathname ? registration.page : fallbackPage
  const contextValue = useMemo(() => ({ registerPage }), [registerPage])

  useLayoutEffect(() => {
    if (
      shouldPreserveInitialSeo.current &&
      pathname === initialPathname.current &&
      registration === null
    ) {
      return
    }

    shouldPreserveInitialSeo.current = false
    applySeoPage(activePage)
  }, [activePage, pathname, registration])

  return (
    <SeoRegistrationContext.Provider value={contextValue}>
      {children}
    </SeoRegistrationContext.Provider>
  )
}
