import { useContext, useId, useLayoutEffect } from 'react'

import { applySeoPage } from '@/shared/seo/seoHead'
import { SeoRegistrationContext } from '@/shared/seo/SeoRegistrationContext'
import type { SeoPage } from '@/shared/seo/types'

interface PageSeoProps {
  page: SeoPage
}

export const PageSeo = ({ page }: PageSeoProps) => {
  const registration = useContext(SeoRegistrationContext)
  const registrationId = useId()
  const pathname = new URL(page.canonical).pathname

  useLayoutEffect(() => {
    if (registration) {
      return registration.registerPage({
        id: registrationId,
        page,
        pathname,
      })
    }

    applySeoPage(page)

    return undefined
  }, [page, pathname, registration, registrationId])

  return null
}
