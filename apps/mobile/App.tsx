import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'

import { AppSplash } from './src/AppSplash'
import { useAppWebView } from './src/useAppWebView'
import { getWebUrl } from './src/webviewNavigation'

const WEB_URL = getWebUrl(process.env.EXPO_PUBLIC_WEB_URL)

export const App = () => {
  const { request, isLoading, hasError, retry, handlers } =
    useAppWebView(WEB_URL)

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" />
        {!WEB_URL ? (
          <View style={styles.message}>
            <Text style={styles.title}>웹 주소를 확인해주세요</Text>
            <Text style={styles.description}>
              EXPO_PUBLIC_WEB_URL에 HTTPS 주소를 설정한 뒤 앱을 다시
              실행해주세요.
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            <WebView<unknown>
              key={request.attempt}
              style={styles.content}
              source={{ uri: request.uri }}
              originWhitelist={['*']}
              contentInsetAdjustmentBehavior="never"
              automaticallyAdjustContentInsets={false}
              mixedContentMode="never"
              {...handlers}
              renderError={() => <View />}
            />
            {isLoading && !hasError && (
              <View
                pointerEvents="none"
                style={[StyleSheet.absoluteFill, styles.loading]}
              >
                <ActivityIndicator
                  size="large"
                  color="#272f32"
                  accessibilityLabel="불러오는 중"
                />
              </View>
            )}
            {hasError && (
              <View style={[StyleSheet.absoluteFill, styles.message]}>
                <Text style={styles.title}>화면을 불러오지 못했어요</Text>
                <Text style={styles.description}>
                  네트워크 연결을 확인한 뒤 다시 시도해주세요.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.retry,
                    pressed && styles.pressed,
                  ]}
                  onPress={retry}
                >
                  <Text style={styles.retryLabel}>다시 시도</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
      <AppSplash />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  content: { flex: 1 },
  loading: { alignItems: 'center', justifyContent: 'center' },
  message: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#272f32',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#5c7682',
    textAlign: 'center',
  },
  retry: {
    minHeight: 48,
    paddingHorizontal: 24,
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#272f32',
  },
  retryLabel: { color: '#ffffff', fontSize: 16 },
  pressed: { opacity: 0.7 },
})
