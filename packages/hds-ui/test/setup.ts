import '@testing-library/jest-dom/vitest'

if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
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

if (typeof IntersectionObserver === 'undefined') {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
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

if (typeof ResizeObserver === 'undefined') {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class {
      disconnect() {}

      observe() {}

      unobserve() {}
    },
    writable: true,
  })
}
