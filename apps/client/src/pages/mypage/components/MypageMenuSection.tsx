import { MypageMenuItem } from '@/pages/mypage/components/MypageMenuItem'
import type {
  MypageMenuAction,
  MypageMenuSection as MypageMenuSectionType,
} from '@/pages/mypage/types'

type MypageMenuSectionProps = {
  section: MypageMenuSectionType
  onMenuPress: (action: MypageMenuAction) => void
}

export const MypageMenuSection = ({
  section,
  onMenuPress,
}: MypageMenuSectionProps) => {
  return (
    <section>
      <h2 className="typo-body-3 text-warm-gray-300 border-warm-gray-100 border-b pb-2.5">
        {section.title}
      </h2>
      <ul className="pt-3">
        {section.items.map((item) => (
          <MypageMenuItem
            action={item.action}
            key={item.id}
            label={item.label}
            onPress={onMenuPress}
          />
        ))}
      </ul>
    </section>
  )
}
