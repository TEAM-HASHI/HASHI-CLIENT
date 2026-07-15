import { describe, expect, it } from 'vitest'

import { VIEWPORT_CONTENT } from '@/root'

describe('client viewport policy', () => {
  it('disables page zoom in the PWA viewport declaration', () => {
    expect(VIEWPORT_CONTENT).toContain('maximum-scale=1.0')
    expect(VIEWPORT_CONTENT).toContain('user-scalable=no')
  })
})
