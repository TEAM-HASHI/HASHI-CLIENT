import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('client viewport policy', () => {
  it('disables page zoom in the PWA viewport declaration', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')

    expect(html).toContain('maximum-scale=1.0')
    expect(html).toContain('user-scalable=no')
  })
})
