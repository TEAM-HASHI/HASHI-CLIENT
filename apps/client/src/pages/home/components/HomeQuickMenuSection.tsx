import type { ReactNode } from 'react'
import {
  HashiPickIcon,
  MagazineIcon,
  PopularIcon,
  TodayRestaurantIcon,
} from '@hashi/hds-icons'

import { QuickMenuItem } from '@/pages/home/components/QuickMenuItem'
import type { HomeQuickLink } from '@/pages/home/homeContent'

const quickLinkIcon = {
  hashiPick: <HashiPickIcon />,
  popular: <PopularIcon />,
  magazine: <MagazineIcon />,
  todayRestaurant: <TodayRestaurantIcon />,
} satisfies Record<HomeQuickLink['id'], ReactNode>

interface HomeQuickMenuSectionProps {
  quickLinks: HomeQuickLink[]
}

export const HomeQuickMenuSection = ({
  quickLinks,
}: HomeQuickMenuSectionProps) => {
  return (
    <nav aria-label="주요 기능" className="mt-6">
      <ul className="grid grid-cols-4">
        {quickLinks.map(({ id, label, to }) => (
          <li key={id}>
            <QuickMenuItem icon={quickLinkIcon[id]} label={label} to={to} />
          </li>
        ))}
      </ul>
    </nav>
  )
}
