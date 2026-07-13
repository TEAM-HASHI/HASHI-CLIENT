import type { ReactNode } from 'react'

export const RestaurantReplacementSection = ({
  label,
  enabled,
  children,
  onChange,
}: {
  label: string
  enabled: boolean
  children: ReactNode
  onChange: (enabled: boolean) => void
}) => (
  <section className="border-cool-gray-100 rounded-lg border p-4">
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={enabled}
        className="mt-1"
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <strong className="text-cool-gray-900 block text-sm">
          {label} 전체 교체
        </strong>
        <span className="text-cool-gray-500 mt-1 block text-xs leading-5">
          이 항목을 저장하면 기존 목록 전체가 현재 입력값으로 교체됩니다.
        </span>
      </span>
    </label>
    {enabled ? <div className="mt-4">{children}</div> : null}
  </section>
)
