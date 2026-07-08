import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface QuickMenuItemProps {
  icon: ReactNode
  label: string
  to: string
}

export const QuickMenuItem = ({ icon, label, to }: QuickMenuItemProps) => {
  return (
    <Link
      className="typo-caption-3 text-primary-200 flex min-w-0 flex-col items-center gap-1 text-center"
      to={to}
    >
      <span
        aria-hidden="true"
        className="flex size-[50px] items-center justify-center text-[50px]"
      >
        {icon}
      </span>
      <span className="w-full truncate">{label}</span>
    </Link>
  )
}
