import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string
  description: string
  icon: ReactNode
}

export const MetricCard = ({
  label,
  value,
  description,
  icon,
}: MetricCardProps) => {
  return (
    <section className="border-cool-gray-100 rounded-lg border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-cool-gray-500 text-sm font-semibold">{label}</p>
          <p className="text-cool-gray-900 mt-2 text-3xl font-bold">{value}</p>
        </div>
        <span className="bg-primary-100 text-primary-200 flex size-11 shrink-0 items-center justify-center rounded-lg">
          {icon}
        </span>
      </div>
      <p className="text-cool-gray-500 mt-4 text-sm">{description}</p>
    </section>
  )
}
