import type { MypageMenuAction } from '@/pages/mypage/types'

const menuItemClassName =
  'typo-body-4 text-cool-gray-900 flex h-7.5 w-full items-center text-left'

type MenuItemProps = {
  label: string
  action: MypageMenuAction
  onPress: (action: MypageMenuAction) => void
}

export const MenuItem = ({ label, action, onPress }: MenuItemProps) => {
  if (action.type === 'external') {
    return (
      <li>
        <a
          className={menuItemClassName}
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
        className={menuItemClassName}
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
