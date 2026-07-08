import { Button } from '@hashi/hds-ui'

interface ProfileNewBottomBarProps {
  disabled: boolean
  formId: string
  loading?: boolean
}

export const ProfileNewBottomBar = ({
  disabled,
  formId,
  loading = false,
}: ProfileNewBottomBarProps) => {
  return (
    <div className="app-mobile-fixed-bottom z-fixed bg-white px-5 pt-[17px] pb-[calc(17px+var(--safe-area-bottom,0px))]">
      <Button
        disabled={disabled}
        form={formId}
        loading={loading}
        size="lg"
        type="submit"
        width="full"
      >
        완료
      </Button>
    </div>
  )
}
