import { LinkIcon, ShareIcon } from '@hashi/hds-icons'
import { IconButton, showToast, toastQueue } from '@hashi/hds-ui'

import { copyCurrentUrlToClipboard, copyUrlToClipboard } from '@/shared/utils'

interface ShareIconButtonProps {
  shareUrl?: string
}

export const ShareIconButton = ({ shareUrl }: ShareIconButtonProps) => {
  const handlePressShare = async () => {
    const isCopied = await (shareUrl
      ? copyUrlToClipboard(shareUrl)
      : copyCurrentUrlToClipboard())

    if (!isCopied) {
      return
    }

    toastQueue.clear()
    showToast({
      icon: <LinkIcon className="size-6" />,
      children: '링크가 복사 되었어요.',
    })
  }

  return (
    <IconButton aria-label="공유하기" onClick={handlePressShare} size="xs">
      <ShareIcon className="size-6" />
    </IconButton>
  )
}
