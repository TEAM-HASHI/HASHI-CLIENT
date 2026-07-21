import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { queryClient } from '@/shared/lib/queryClient'
import {
  getAdminSession,
  subscribeAdminSession,
} from '@/shared/auth/adminSession'

interface QueryProviderProps {
  children: ReactNode
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  useEffect(() => {
    return subscribeAdminSession(() => {
      if (!getAdminSession()) {
        queryClient.clear()
      }
    })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
