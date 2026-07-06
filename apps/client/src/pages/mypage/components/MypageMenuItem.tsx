import type { MypageMenuAction } from '@/pages/mypage/types'

type MypageMenuItemProps = {
  label: string
  action: MypageMenuAction
  onPress: (action: MypageMenuAction) => void
}

export const MypageMenuItem = ({
  label,
  action,
  onPress,
}: MypageMenuItemProps) => {
  return (
    <li>
      <button
        className="typo-body-4 text-cool-gray-900 h-9 w-full text-left"
        onClick={() => {
          onPress(action)
        }}
        type="button"
      >
        {label}
      </button>
    </li>
  )
}
