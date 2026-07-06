import type { ReactNode } from 'react'
import {
  HashiPickIcon,
  MagazineIcon,
  PopularIcon,
  TodayRestaurantIcon,
} from '@hashi/hds-icons'

import type { HomeQuickLink } from '../homeContent'
import { QuickMenuItem } from './QuickMenuItem'

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
      <ul className="flex justify-center gap-10">
        {quickLinks.map(({ id, label, to }) => (
          <li key={id}>
            <QuickMenuItem icon={quickLinkIcon[id]} label={label} to={to} />
          </li>
        ))}
      </ul>
    </nav>
  )
}
