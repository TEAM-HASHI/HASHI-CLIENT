import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

import { ROUTES } from '@/app/router/path'
import { WithdrawalBottomBar } from '@/pages/withdrawal/components/WithdrawalBottomBar'
import { WithdrawalConfirmation } from '@/pages/withdrawal/components/WithdrawalConfirmation'
import { WithdrawalNoticeSection } from '@/pages/withdrawal/components/WithdrawalNoticeSection'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'

export const WithdrawalPage = () => {
  const navigate = useNavigate()
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)

  const handleReturnToMypage = () => {
    navigate(ROUTES.mypage)
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="app-mobile-fixed-top z-fixed bg-white">
        <Header
          leftAction={
            <IconButton
              aria-label="뒤로가기"
              onClick={handleReturnToMypage}
              size="xs"
            >
              <BackIcon className="size-6" />
            </IconButton>
          }
          title="탈퇴하기"
        />
      </div>

      <main className="flex min-h-dvh flex-col px-7.5 pt-23.75 pb-[calc(134px+var(--safe-area-bottom,0px))]">
        <WithdrawalNoticeSection />
        <WithdrawalConfirmation
          checked={isConfirmed}
          onCheckedChange={setIsConfirmed}
        />
      </main>

      <WithdrawalBottomBar
        canWithdraw={isConfirmed}
        onReturn={handleReturnToMypage}
        onWithdraw={() => {
          setIsComingSoonOpen(true)
        }}
      />

      <ComingSoonDialog
        open={isComingSoonOpen}
        onOpenChange={setIsComingSoonOpen}
      />
    </div>
  )
}
