import { createContext } from 'react'

import type { SeoPage } from '@/shared/seo/types'

export interface SeoRegistration {
  id: string
  page: SeoPage
  pathname: string
}

interface SeoRegistrationContextValue {
  registerPage: (registration: SeoRegistration) => () => void
}

export const SeoRegistrationContext =
  createContext<SeoRegistrationContextValue | null>(null)
