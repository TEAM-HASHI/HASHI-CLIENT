import { SaveIcon } from '@hashi/hds-icons'
import { COLLECTION_PIN_COLORS } from '@/features/collection/constants/collectionPalette'

export const CollectionMapMarker = ({
  name,
  color,
  onSelect,
}: {
  name: string
  color?: string
  onSelect: () => void
}) => {
  const backgroundColor =
    color && Object.hasOwn(COLLECTION_PIN_COLORS, color)
      ? COLLECTION_PIN_COLORS[color as keyof typeof COLLECTION_PIN_COLORS]
      : undefined
  return (
    <button
      type="button"
      aria-label={`${name} 컬렉션 지도 핀`}
      onClick={onSelect}
      className="flex size-11 items-center justify-center rounded-full focus-visible:outline-2"
    >
      <span
        className="flex size-5 items-center justify-center rounded-full shadow-[0_0_2px_rgba(0,0,0,0.25)] ring-1 ring-white"
        style={{
          backgroundColor: backgroundColor ?? 'var(--color-cool-gray-600)',
        }}
      >
        <SaveIcon aria-hidden="true" className="size-3 text-white" />
      </span>
    </button>
  )
}
