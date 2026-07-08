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
  if (action.type === 'external' && action.url) {
    return (
      <li>
        <a
          className="typo-body-4 text-cool-gray-900 flex h-9 w-full items-center text-left"
          href={action.url}
          rel="noreferrer"
          target="_blank"
        >
          {label}
        </a>
      </li>
    )
  }

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
