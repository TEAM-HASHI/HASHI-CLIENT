import { useRef, useState } from 'react'
import { Alert, Linking } from 'react-native'
import type { WebViewProps } from 'react-native-webview'

import { getNavigationTarget } from './webviewNavigation'

export const useAppWebView = (webUrl: string | null) => {
  const origin = webUrl ? new URL(webUrl).origin : ''
  const currentUrl = useRef(webUrl)
  const failed = useRef(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [request, setRequest] = useState({ uri: webUrl ?? '', attempt: 0 })

  const showError = () => {
    failed.current = true
    setHasError(true)
    setIsLoading(false)
  }

  const openExternalUrl = async (url: string) => {
    if (getNavigationTarget(url, origin) === 'blocked') return
    try {
      await Linking.openURL(url)
    } catch {
      Alert.alert('링크를 열지 못했어요', '잠시 후 다시 시도해주세요.')
    }
  }

  const handlers = {
    onNavigationStateChange: ({ url }) => {
      if (getNavigationTarget(url, origin) === 'internal')
        currentUrl.current = url
    },
    onShouldStartLoadWithRequest: ({ url, isTopFrame }) => {
      if (isTopFrame === false) return true
      const target = getNavigationTarget(url, origin)
      if (target === 'external') void openExternalUrl(url)
      return target === 'internal'
    },
    onOpenWindow: ({ nativeEvent }) => {
      void openExternalUrl(nativeEvent.targetUrl)
    },
    onLoadStart: ({ nativeEvent }) => {
      if (
        failed.current ||
        getNavigationTarget(nativeEvent.url, origin) !== 'internal'
      )
        return
      currentUrl.current = nativeEvent.url
      if (nativeEvent.loading) setIsLoading(true)
    },
    onLoadEnd: () => setIsLoading(false),
    onError: showError,
    onHttpError: ({ nativeEvent }) => {
      if (nativeEvent.url === currentUrl.current) showError()
    },
    onContentProcessDidTerminate: showError,
    onRenderProcessGone: showError,
  } satisfies WebViewProps

  const load = (uri: string) => {
    failed.current = false
    currentUrl.current = uri
    setHasError(false)
    setIsLoading(true)
    setRequest((previous) => ({ uri, attempt: previous.attempt + 1 }))
  }

  const retry = () => {
    const uri = currentUrl.current
    if (uri && getNavigationTarget(uri, origin) === 'internal') load(uri)
    else if (webUrl) load(webUrl)
  }

  return { request, isLoading, hasError, retry, handlers }
}
