import { NextIcon } from '@hashi/hds-icons'
import { cn } from '@/shared/utils'
import type { MypageMenuAction } from '@/pages/mypage/types'

type MenuButtonProps = {
  label: string
  count?: number
  action: MypageMenuAction
  highlighted?: boolean
  onPress: (action: MypageMenuAction) => void
}

export const MenuButton = ({
  label,
  count,
  action,
  highlighted = false,
  onPress,
}: MenuButtonProps) => {
  return (
    <button
      className={cn(
        'flex h-13 w-full items-center justify-between rounded-[5px] pr-2 pl-4 text-left',
        highlighted
          ? 'bg-cool-gray-800 text-white'
          : 'bg-primary-100 text-cool-gray-900',
      )}
      onClick={() => {
        onPress(action)
      }}
      type="button"
    >
      <span className="typo-sub-header-2 min-w-0 truncate">{label}</span>
      <span className="flex shrink-0 items-center gap-1">
        {count !== undefined ? (
          <span className="typo-sub-header-1">{count}</span>
        ) : null}
        <NextIcon aria-hidden="true" className="size-6" />
      </span>
    </button>
  )
}
