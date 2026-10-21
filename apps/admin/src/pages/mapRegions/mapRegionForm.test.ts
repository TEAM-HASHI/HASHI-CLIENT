import { describe, expect, it } from 'vitest'
import {
  createRegionForm,
  toRegionBody,
} from '@/pages/mapRegions/mapRegionForm'

const form = () => ({
  ...createRegionForm(),
  code: 'TOKYO_TEST',
  name: '테스트',
  latitude: '35.5',
  longitude: '139.5',
  south: '35',
  north: '36',
  west: '139',
  east: '140',
})

describe('region replacement safeguards', () => {
  it('rejects precision loss instead of silently rounding coordinates', () => {
    expect(() => toRegionBody({ ...form(), latitude: '35.5000001' })).toThrow(
      /6자리/,
    )
    expect(
      toRegionBody({ ...form(), latitude: '35.5000000' }).clusterPosition
        .latitude,
    ).toBe(35.5)
  })
  it('rejects inverted bounds and centers outside them, but allows larger inactive drafts', () => {
    expect(() => toRegionBody({ ...form(), south: '36' })).toThrow(/경계/)
    expect(() => toRegionBody({ ...form(), longitude: '141' })).toThrow(/대표/)
    expect(toRegionBody({ ...form(), north: '38' }).active).toBe(false)
    expect(() =>
      toRegionBody({ ...form(), north: '38', active: true }),
    ).toThrow(/1도/)
  })
  it('preserves all existing settings for full replacement and rejects blank coordinates', () => {
    const body = { ...toRegionBody(form()), name: ' 기존 지역 ' }
    expect(
      toRegionBody(
        createRegionForm({ mapRegionId: 4, code: 'TOKYO_TEST', ...body }),
      ),
    ).toEqual(body)
    expect(() => toRegionBody({ ...form(), latitude: '' })).toThrow(/좌표/)
  })
})
