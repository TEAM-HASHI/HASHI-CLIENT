import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

interface NotificationHeaderProps {
  onBack: () => void
  title?: string
  elevated?: boolean
}

export const NotificationHeader = ({
  onBack,
  title = '알림',
  elevated = false,
}: NotificationHeaderProps) => (
  <Header
    elevated={elevated}
    leftAction={
      <IconButton aria-label="뒤로가기" onClick={onBack} size="xs">
        <BackIcon className="size-6" />
      </IconButton>
    }
    title={title}
  />
)
