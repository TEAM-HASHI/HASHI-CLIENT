import { describe, expect, it } from 'vitest'

import { getNavigationTarget, getWebUrl } from './webviewNavigation'

describe('WebView navigation boundaries', () => {
  it('rejects invalid, credential-bearing and non-HTTPS entry URLs', () => {
    expect(getWebUrl(' https://qa.hashi.kr ')).toBe('https://qa.hashi.kr/')
    for (const value of [
      undefined,
      '',
      'not a URL',
      'javascript:alert(1)',
      'http://example.com',
      'https://user:password@example.com',
    ]) {
      expect(getWebUrl(value)).toBeNull()
    }
  })

  it('keeps only same-origin HTTPS navigation inside the WebView', () => {
    const origin = 'https://qa.hashi.kr'
    expect(
      getNavigationTarget('https://qa.hashi.kr/restaurants/1', origin),
    ).toBe('internal')
    expect(getNavigationTarget('https://qa.hashi.kr.evil.test/', origin)).toBe(
      'external',
    )
    expect(getNavigationTarget('https://qa.hashi.kr@evil.test/', origin)).toBe(
      'blocked',
    )
  })

  it('allows browser/contact links but blocks executable and local-file schemes', () => {
    const origin = 'https://qa.hashi.kr'
    for (const url of [
      'https://maps.google.com',
      'tel:0312345678',
      'mailto:help@hashi.kr',
    ]) {
      expect(getNavigationTarget(url, origin)).toBe('external')
    }
    for (const url of [
      'javascript:alert(1)',
      'file:///etc/passwd',
      'intent://example',
      'http://qa.hashi.kr',
      'invalid',
    ]) {
      expect(getNavigationTarget(url, origin)).toBe('blocked')
    }
  })
})
