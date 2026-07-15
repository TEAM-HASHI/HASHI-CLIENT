const GA_SCRIPT_ID = 'google-analytics-script'

type GtagCommand = [string, ...unknown[]]

declare global {
  interface Window {
    dataLayer?: GtagCommand[]
    gtag?: (...args: GtagCommand) => void
  }
}

const getGaMeasurementId = () => import.meta.env.VITE_GA_MEASUREMENT_ID?.trim()

export const isAnalyticsEnabled = () => Boolean(getGaMeasurementId())

export const initAnalytics = () => {
  const gaMeasurementId = getGaMeasurementId()

  if (!gaMeasurementId || typeof window === 'undefined') {
    return
  }

  window.dataLayer = window.dataLayer ?? []
  window.gtag =
    window.gtag ??
    ((...args: GtagCommand) => {
      window.dataLayer?.push(args)
    })

  if (!document.getElementById(GA_SCRIPT_ID)) {
    const script = document.createElement('script')
    script.id = GA_SCRIPT_ID
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`
    document.head.appendChild(script)
  }

  window.gtag('js', new Date())
  window.gtag('config', gaMeasurementId, { send_page_view: false })
}

export const trackPageView = (path: string) => {
  const gaMeasurementId = getGaMeasurementId()

  if (!gaMeasurementId || typeof window === 'undefined' || !window.gtag) {
    return
  }

  window.gtag('event', 'page_view', {
    page_location: `${window.location.origin}${path}`,
    page_path: path,
  })
}
