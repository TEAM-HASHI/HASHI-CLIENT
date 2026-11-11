import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

import { WithdrawalBottomBar } from '@/pages/withdrawal/components/WithdrawalBottomBar'
import { WithdrawalConfirmation } from '@/pages/withdrawal/components/WithdrawalConfirmation'
import { WithdrawalNoticeSection } from '@/pages/withdrawal/components/WithdrawalNoticeSection'
import { useWithdrawalPage } from '@/pages/withdrawal/hooks/useWithdrawalPage'
import { PageFixedArea } from '@/shared/components/pageFixedArea/PageFixedArea'

export const WithdrawalPage = () => {
  const {
    isConfirmed,
    isPending,
    setIsConfirmed,
    handleReturn,
    handleWithdraw,
  } = useWithdrawalPage()

  return (
    <div className="min-h-dvh bg-white">
      <PageFixedArea>
        <div className="app-mobile-fixed-top z-fixed bg-white">
          <Header
            leftAction={
              <IconButton
                aria-label="뒤로가기"
                onClick={handleReturn}
                disabled={isPending}
                size="xs"
              >
                <BackIcon className="size-6" />
              </IconButton>
            }
            title="탈퇴하기"
          />
        </div>
      </PageFixedArea>

      <div className="flex min-h-dvh flex-col gap-7 px-7.5 pt-23.75 pb-5">
        <WithdrawalNoticeSection />
        <WithdrawalConfirmation
          checked={isConfirmed}
          disabled={isPending}
          onCheckedChange={setIsConfirmed}
        />
      </div>

      <WithdrawalBottomBar
        canWithdraw={isConfirmed && !isPending}
        isPending={isPending}
        onReturn={handleReturn}
        onWithdraw={handleWithdraw}
      />
    </div>
  )
}
