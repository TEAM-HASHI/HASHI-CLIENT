import { LinkIcon } from '@hashi/hds-icons'
import { showToast, toastQueue } from '@hashi/hds-ui'
import { useCallback } from 'react'

import { copyCurrentUrlToClipboard, copyUrlToClipboard } from '@/shared/utils'

export const useShareLink = (shareUrl?: string) => {
  return useCallback(async () => {
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
  }, [shareUrl])
}
