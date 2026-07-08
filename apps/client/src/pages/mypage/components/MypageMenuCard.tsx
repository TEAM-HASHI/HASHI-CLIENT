import { NextIcon } from '@hashi/hds-icons'
import { cn } from '@/shared/utils'
import type { MypageMenuAction } from '@/pages/mypage/types'

type MypageMenuCardProps = {
  label: string
  count?: number
  action: MypageMenuAction
  highlighted?: boolean
  onPress: (action: MypageMenuAction) => void
}

export const MypageMenuCard = ({
  label,
  count,
  action,
  highlighted = false,
  onPress,
}: MypageMenuCardProps) => {
  return (
    <button
      className={cn(
        'flex h-13 w-full items-center justify-between rounded-[5px] px-4 text-left',
        highlighted
          ? 'bg-cool-gray-900 text-white'
          : 'bg-primary-100 text-cool-gray-900',
      )}
      onClick={() => {
        onPress(action)
      }}
      type="button"
    >
      <span className="typo-body-4 min-w-0 truncate">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        {count !== undefined ? (
          <span className="typo-sub-header-1">{count}</span>
        ) : null}
        <NextIcon className="size-4" />
      </span>
    </button>
  )
}
