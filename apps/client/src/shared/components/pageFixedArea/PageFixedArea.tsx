import { createContext, useContext, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const PageFixedAreaContext = createContext<HTMLElement | null>(null)

export const PageFixedAreaProvider = ({
  children,
  container,
}: {
  children: ReactNode
  container: HTMLElement | null
}) => <PageFixedAreaContext value={container}>{children}</PageFixedAreaContext>

export const PageFixedArea = ({
  children,
  enabled = true,
}: {
  children: ReactNode
  enabled?: boolean
}) => {
  const container = useContext(PageFixedAreaContext)
  return container && enabled ? createPortal(children, container) : children
}
