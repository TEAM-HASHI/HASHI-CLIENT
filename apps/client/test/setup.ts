import '@testing-library/jest-dom/vitest'
import { beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn())
})
