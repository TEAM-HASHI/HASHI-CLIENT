import { Checkbox } from '@hashi/hds-ui'

interface WithdrawalConfirmationProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export const WithdrawalConfirmation = ({
  checked,
  onCheckedChange,
}: WithdrawalConfirmationProps) => {
  return (
    <Checkbox
      checked={checked}
      className="typo-body-5 text-cool-gray-700 mt-auto ml-1 gap-2.25"
      onChange={(event) => {
        onCheckedChange(event.target.checked)
      }}
    >
      위 사항을 모두 확인하였고, 탈퇴를 진행합니다.
    </Checkbox>
  )
}
