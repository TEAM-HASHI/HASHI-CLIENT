import { DragPanel } from '@hashi/hds-ui'
import { SavedApiPage } from '@/pages/saved/SavedApiPage'

type MapSavedCollectionsSheetProps = {
  open: boolean
  height: number
  onHeightChange: (height: number) => void
  onClose: () => void
}

export const MapSavedCollectionsSheet = ({
  open,
  height,
  onHeightChange,
  onClose,
}: MapSavedCollectionsSheetProps) => {
  if (!open) return null
  return (
    <div
      className="z-raised pointer-events-none absolute inset-0"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !event.defaultPrevented) {
          event.stopPropagation()
          onClose()
        }
      }}
    >
      <DragPanel
        aria-label="지도 저장 컬렉션"
        handleLabel="컬렉션 목록 높이 조절"
        height={height}
        normalHeight={497}
        maxHeight={497}
        onHeightChange={onHeightChange}
      >
        <SavedApiPage embedded />
      </DragPanel>
    </div>
  )
}
