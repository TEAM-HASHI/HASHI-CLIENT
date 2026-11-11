import { Button } from '@hashi/hds-ui'
import { BottomActionBar } from '@/shared/components/bottomActionBar'

interface WithdrawalBottomBarProps {
  canWithdraw: boolean
  isPending: boolean
  onReturn: () => void
  onWithdraw: () => void
}

export const WithdrawalBottomBar = ({
  canWithdraw,
  isPending,
  onReturn,
  onWithdraw,
}: WithdrawalBottomBarProps) => {
  return (
    <BottomActionBar
      aria-label="회원 탈퇴 액션"
      layout="padded"
      startAction={
        <Button
          disabled={isPending}
          onClick={onReturn}
          size="lg"
          variant="neutral"
          width="full"
        >
          돌아가기
        </Button>
      }
      endAction={
        <Button
          disabled={!canWithdraw}
          onClick={onWithdraw}
          size="lg"
          width="full"
        >
          탈퇴하기
        </Button>
      }
    />
  )
}
