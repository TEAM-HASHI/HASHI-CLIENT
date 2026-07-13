const checkIsInstagramHostname = (hostname: string) => {
  return hostname === 'instagram.com' || hostname.endsWith('.instagram.com')
}

export const normalizeInstagramUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url)
    const isValidProtocol =
      parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:'

    if (!isValidProtocol || !checkIsInstagramHostname(parsedUrl.hostname)) {
      return null
    }

    return parsedUrl.toString()
  } catch {
    return null
  }
}
