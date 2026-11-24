import { Tabs } from '@hashi/hds-ui'
import type { ReactNode } from 'react'

import { NotificationHeader } from '@/features/notification/components/NotificationHeader'
import { PageFixedArea } from '@/shared/components/pageFixedArea/PageFixedArea'

export type NotificationTab = 'news' | 'notice'

const NOTIFICATION_TABS = [
  { value: 'news', label: '소식 알림' },
  { value: 'notice', label: '서비스 공지' },
]

interface NotificationLayoutProps {
  activeTab: NotificationTab
  onTabChange: (tab: NotificationTab) => void
  onBack: () => void
  children: ReactNode
}

export const NotificationLayout = ({
  activeTab,
  onTabChange,
  onBack,
  children,
}: NotificationLayoutProps) => (
  <div className="min-h-dvh bg-white pt-31.25">
    <PageFixedArea>
      <div
        className="app-mobile-fixed-top z-fixed bg-white"
        data-page-scroll-top
      >
        <NotificationHeader onBack={onBack} />
        <div className="px-5">
          <Tabs
            aria-label="알림 종류"
            items={NOTIFICATION_TABS}
            onChange={(tab) => {
              if (tab === 'news' || tab === 'notice') onTabChange(tab)
            }}
            value={activeTab}
          />
        </div>
      </div>
    </PageFixedArea>
    {children}
  </div>
)
