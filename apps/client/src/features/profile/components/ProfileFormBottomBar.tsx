import { Button } from '@hashi/hds-ui'

interface ProfileFormBottomBarProps {
  disabled: boolean
  formId: string
  label: string
  loading?: boolean
}

export const ProfileFormBottomBar = ({
  disabled,
  formId,
  label,
  loading = false,
}: ProfileFormBottomBarProps) => {
  return (
    <div className="mt-auto bg-white px-5 pt-11.25 pb-[calc(48px+var(--safe-area-bottom,0px))]">
      <Button
        disabled={disabled}
        form={formId}
        loading={loading}
        size="lg"
        type="submit"
        width="full"
      >
        {label}
      </Button>
    </div>
  )
}
