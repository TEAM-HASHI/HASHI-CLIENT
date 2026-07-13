import { CloseSmallIcon } from '@hashi/hds-icons'
import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface DrawerProps {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
  onClose: () => void
}

const drawerSizeClassName = {
  md: 'max-w-[31rem]',
  lg: 'max-w-[46rem]',
}

export const Drawer = ({
  open,
  title,
  description,
  children,
  footer,
  size = 'md',
  onClose,
}: DrawerProps) => {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="드로어 닫기"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-drawer-title"
        className={cn(
          'absolute top-0 right-0 flex h-full w-full flex-col bg-white shadow-2xl',
          drawerSizeClassName[size],
        )}
      >
        <header className="border-cool-gray-100 flex items-start justify-between gap-4 border-b px-6 py-5">
          <div className="min-w-0">
            <h2
              id="admin-drawer-title"
              className="text-cool-gray-900 text-lg font-bold"
            >
              {title}
            </h2>
            {description ? (
              <p className="text-cool-gray-500 mt-1 text-sm">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="닫기"
            className="text-cool-gray-500 hover:bg-cool-gray-50 flex size-9 shrink-0 items-center justify-center rounded-md"
            onClick={onClose}
          >
            <CloseSmallIcon aria-hidden="true" className="size-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer ? (
          <footer className="border-cool-gray-100 flex justify-end gap-2 border-t px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>
  )
}
