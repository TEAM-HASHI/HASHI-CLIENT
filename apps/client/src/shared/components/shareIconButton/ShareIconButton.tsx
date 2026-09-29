import { ShareIcon } from '@hashi/hds-icons'
import { IconButton } from '@hashi/hds-ui'

import { useShareLink } from '@/shared/components/shareIconButton/useShareLink'

interface ShareIconButtonProps {
  shareUrl?: string
}

export const ShareIconButton = ({ shareUrl }: ShareIconButtonProps) => {
  const handlePressShare = useShareLink(shareUrl)

  return (
    <IconButton aria-label="공유하기" onClick={handlePressShare} size="xs">
      <ShareIcon className="size-6" />
    </IconButton>
  )
}
