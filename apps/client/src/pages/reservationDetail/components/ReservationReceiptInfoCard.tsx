import type { ReactNode } from 'react'

export type ReservationReceiptInfoItem = {
  label: string
  value: ReactNode
}

export type ReservationReceiptInfoCardProps = {
  title: string
  items: readonly ReservationReceiptInfoItem[]
}

export const ReservationReceiptInfoCard = ({
  title,
  items,
}: ReservationReceiptInfoCardProps) => {
  return (
    <section className="border-warm-gray-100 mb-9.25 rounded-[10px] border px-5 py-4">
      <h2 className="typo-sub-header-2 text-primary-200 mb-5">{title}</h2>

      <dl className="space-y-3">
        {items.map((item) => (
          <div
            className="flex items-start justify-between gap-12"
            key={item.label}
          >
            <dt className="typo-body-7 text-cool-gray-500 shrink-0">
              {item.label}
            </dt>
            <dd className="typo-body-7 text-primary-200 min-w-0 text-right break-keep">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
