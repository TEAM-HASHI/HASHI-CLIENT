import { MenuItem } from '@/pages/mypage/components/MenuItem'
import type {
  MypageMenuAction,
  MypageMenuSection as MypageMenuSectionType,
} from '@/pages/mypage/types'

type MypageMenuSectionProps = {
  isLoggingOut?: boolean
  section: MypageMenuSectionType
  onMenuPress: (action: MypageMenuAction) => void
}

export const MypageMenuSection = ({
  section,
  onMenuPress,
  isLoggingOut,
}: MypageMenuSectionProps) => {
  return (
    <section>
      <h2 className="typo-sub-header-2 text-warm-gray-300 border-warm-gray-100 flex h-7.5 items-center border-b">
        {section.title}
      </h2>
      <ul className="flex flex-col gap-3 pt-3">
        {section.items.map((item) => (
          <MenuItem
            action={item.action}
            disabled={item.action.type === 'logout' && isLoggingOut}
            key={item.id}
            label={item.label}
            onPress={onMenuPress}
          />
        ))}
      </ul>
    </section>
  )
}
