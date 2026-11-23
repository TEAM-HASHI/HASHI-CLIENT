export const getWebUrl = (value: string | undefined): string | null => {
  try {
    const url = new URL(value?.trim() ?? '')
    return url.protocol === 'https:' && !url.username && !url.password
      ? url.href
      : null
  } catch {
    return null
  }
}

export const getNavigationTarget = (
  value: string,
  origin: string,
): 'internal' | 'external' | 'blocked' => {
  try {
    const url = new URL(value)
    if (url.username || url.password) return 'blocked'
    if (url.protocol === 'https:') {
      return url.origin === origin ? 'internal' : 'external'
    }
    return ['tel:', 'mailto:'].includes(url.protocol) ? 'external' : 'blocked'
  } catch {
    return 'blocked'
  }
}
