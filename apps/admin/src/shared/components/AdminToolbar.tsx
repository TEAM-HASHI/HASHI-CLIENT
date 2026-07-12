import type { ReactNode } from 'react'

interface AdminToolbarProps {
  children: ReactNode
}

export const AdminToolbar = ({ children }: AdminToolbarProps) => {
  return (
    <div className="border-cool-gray-100 flex flex-col gap-3 border-b bg-white px-5 py-4 lg:px-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        {children}
      </div>
    </div>
  )
}
