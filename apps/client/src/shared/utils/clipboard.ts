const clearDocumentSelection = () => {
  window.getSelection()?.removeAllRanges()
}

const copySelectedText = () => {
  const copyCommand = Reflect.get(document, 'execCommand') as
    | ((commandId: 'copy') => boolean)
    | undefined

  return copyCommand?.call(document, 'copy') ?? false
}

const copyTextWithSelection = (text: string) => {
  const copyTarget = document.createElement('pre')
  copyTarget.textContent = text
  copyTarget.setAttribute('aria-hidden', 'true')
  copyTarget.setAttribute('data-clipboard-copy-target', 'true')
  copyTarget.tabIndex = -1
  copyTarget.style.position = 'fixed'
  copyTarget.style.top = '-9999px'
  copyTarget.style.left = '0'
  copyTarget.style.width = '1px'
  copyTarget.style.height = '1px'
  copyTarget.style.overflow = 'hidden'
  copyTarget.style.pointerEvents = 'none'
  copyTarget.style.userSelect = 'text'
  copyTarget.style.whiteSpace = 'pre-wrap'

  clearDocumentSelection()
  document.body.append(copyTarget)
  copyTarget.focus({ preventScroll: true })

  const range = document.createRange()
  range.selectNodeContents(copyTarget)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)

  try {
    return copySelectedText()
  } catch {
    return false
  } finally {
    copyTarget.remove()
    clearDocumentSelection()
  }
}

export const copyTextToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Clipboard API can fail outside HTTPS/localhost or without browser permission.
  }

  return copyTextWithSelection(text)
}

export const copyUrlToClipboard = async (url: string) => {
  const shareUrl = new URL(url, window.location.origin).href

  return copyTextToClipboard(shareUrl)
}

export const copyCurrentUrlToClipboard = async () => {
  return copyUrlToClipboard(window.location.href)
}
