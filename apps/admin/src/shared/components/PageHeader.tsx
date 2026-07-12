import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description: string
  children?: ReactNode
}

export const PageHeader = ({
  title,
  description,
  children,
}: PageHeaderProps) => {
  return (
    <header className="border-cool-gray-100 flex flex-col gap-4 border-b bg-white px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="min-w-0">
        <h1 className="text-cool-gray-900 truncate text-xl font-bold">
          {title}
        </h1>
        <p className="text-cool-gray-500 mt-1 text-sm">{description}</p>
      </div>
      {children ? (
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      ) : null}
    </header>
  )
}
