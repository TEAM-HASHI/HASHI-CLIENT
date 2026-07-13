/// <reference lib="dom" />

import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.stubEnv('VITE_API_BASE_URL', 'https://api.hashi.test')

const installLocalStorageMock = () => {
  if (typeof window === 'undefined') {
    return
  }

  const localStorageDescriptor = Object.getOwnPropertyDescriptor(
    window,
    'localStorage',
  )

  if (
    localStorageDescriptor &&
    'value' in localStorageDescriptor &&
    localStorageDescriptor.value
  ) {
    return
  }

  const storageData = new WeakMap<Storage, Map<string, string>>()

  const getStorageMap = (storage: Storage) => {
    const currentStorageMap = storageData.get(storage)

    if (currentStorageMap) {
      return currentStorageMap
    }

    const nextStorageMap = new Map<string, string>()
    storageData.set(storage, nextStorageMap)

    return nextStorageMap
  }

  const storage = Object.create(Storage.prototype) as Storage

  Object.defineProperties(Storage.prototype, {
    clear: {
      configurable: true,
      value() {
        getStorageMap(this as Storage).clear()
      },
    },
    getItem: {
      configurable: true,
      value(key: string) {
        return getStorageMap(this as Storage).get(String(key)) ?? null
      },
    },
    key: {
      configurable: true,
      value(index: number) {
        return Array.from(getStorageMap(this as Storage).keys())[index] ?? null
      },
    },
    length: {
      configurable: true,
      get() {
        return getStorageMap(this as Storage).size
      },
    },
    removeItem: {
      configurable: true,
      value(key: string) {
        getStorageMap(this as Storage).delete(String(key))
      },
    },
    setItem: {
      configurable: true,
      value(key: string, value: string) {
        getStorageMap(this as Storage).set(String(key), String(value))
      },
    },
  })

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: storage,
  })
}

installLocalStorageMock()

Object.defineProperty(window, 'scrollTo', {
  configurable: true,
  value: vi.fn(),
})

type TestGlobal = typeof globalThis & {
  IntersectionObserver?: unknown
  matchMedia?: unknown
  ResizeObserver?: unknown
  window?: {
    matchMedia?: unknown
  }
}

const testGlobal = globalThis as TestGlobal
const testWindow = testGlobal.window ?? testGlobal

if (typeof testWindow.matchMedia !== 'function') {
  Object.defineProperty(testWindow, 'matchMedia', {
    value: () => ({
      addEventListener: () => {},
      addListener: () => {},
      dispatchEvent: () => false,
      matches: false,
      media: '',
      onchange: null,
      removeEventListener: () => {},
      removeListener: () => {},
    }),
    writable: true,
  })
}

if (typeof testGlobal.IntersectionObserver === 'undefined') {
  Object.defineProperty(testGlobal, 'IntersectionObserver', {
    configurable: true,
    value: class {
      disconnect() {}

      observe() {}

      takeRecords() {
        return []
      }

      unobserve() {}
    },
    writable: true,
  })
}

if (typeof testGlobal.ResizeObserver === 'undefined') {
  Object.defineProperty(testGlobal, 'ResizeObserver', {
    configurable: true,
    value: class {
      disconnect() {}

      observe() {}

      unobserve() {}
    },
    writable: true,
  })
}
