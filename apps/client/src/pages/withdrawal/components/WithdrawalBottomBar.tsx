import { Button } from '@hashi/hds-ui'

interface WithdrawalBottomBarProps {
  canWithdraw: boolean
  onReturn: () => void
  onWithdraw: () => void
}

export const WithdrawalBottomBar = ({
  canWithdraw,
  onReturn,
  onWithdraw,
}: WithdrawalBottomBarProps) => {
  return (
    <footer
      aria-label="회원 탈퇴 액션"
      className="app-mobile-fixed-bottom z-fixed bg-white px-5 pt-4 pb-[calc(48px+var(--safe-area-bottom,0px))]"
    >
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={onReturn} size="lg" variant="neutral" width="full">
          돌아가기
        </Button>
        <Button
          disabled={!canWithdraw}
          onClick={onWithdraw}
          size="lg"
          width="full"
        >
          탈퇴하기
        </Button>
      </div>
    </footer>
  )
}
