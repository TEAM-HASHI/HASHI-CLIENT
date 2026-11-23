import { isRunningInExpoGo } from 'expo'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import { Animated, Image, Platform, StyleSheet, Text, View } from 'react-native'

const holdMs = 3000
const fadeMs = 300
const useNativeSplash = !isRunningInExpoGo()
// Metro uses a static require to register the bundled image.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const logo = require('../assets/app-logo.png')

if (useNativeSplash) {
  void SplashScreen.preventAutoHideAsync().catch(console.warn)
}

export const AppSplash = () => {
  const [layoutReady, setLayoutReady] = useState(false)
  const [logoReady, setLogoReady] = useState(Platform.OS !== 'android')
  const [visible, setVisible] = useState(useNativeSplash)
  const [opacity] = useState(() => new Animated.Value(1))

  useEffect(() => {
    if (!layoutReady || !logoReady) return

    SplashScreen.hide()
    const fade = Animated.timing(opacity, {
      toValue: 0,
      duration: fadeMs,
      useNativeDriver: true,
    })
    const timer = setTimeout(() => {
      fade.start(({ finished }) => {
        if (finished) setVisible(false)
      })
    }, holdMs)

    return () => {
      clearTimeout(timer)
      fade.stop()
    }
  }, [layoutReady, logoReady, opacity])

  if (!visible) return null

  return (
    <Animated.View
      accessibilityViewIsModal
      onLayout={() => setLayoutReady(true)}
      style={[styles.screen, { opacity }]}
    >
      <View style={styles.brand}>
        <Image
          source={logo}
          resizeMode="contain"
          fadeDuration={0}
          onLoadEnd={() => setLogoReady(true)}
          style={styles.logo}
        />
        <Text style={styles.tagline}>발견부터 예약까지, 포기없이</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#ffffff',
  },
  brand: {
    position: 'absolute',
    top: '39.22%', // Figma: y 334.19 on an 852pt screen.
    left: 24,
    right: 24,
    alignItems: 'center',
    gap: 14,
  },
  logo: { width: 132, height: 41.25 },
  tagline: {
    color: '#000000',
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    includeFontPadding: false,
    textAlign: 'center',
  },
})
