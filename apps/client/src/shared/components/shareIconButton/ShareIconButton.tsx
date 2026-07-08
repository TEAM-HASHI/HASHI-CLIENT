import { ShareIcon } from '@hashi/hds-icons'
import { IconButton } from '@hashi/hds-ui'

import { copyCurrentUrlToClipboard, copyUrlToClipboard } from '@/shared/utils'

interface ShareIconButtonProps {
  shareUrl?: string
}

export const ShareIconButton = ({ shareUrl }: ShareIconButtonProps) => {
  const handlePressShare = () => {
    void (shareUrl ? copyUrlToClipboard(shareUrl) : copyCurrentUrlToClipboard())
    // TODO: 링크 복사 성공 토스트 연결
  }

  return (
    <IconButton aria-label="공유하기" onClick={handlePressShare} size="xs">
      <ShareIcon className="size-6" />
    </IconButton>
  )
}
