import { describe, expect, it } from 'vitest'

import {
  ERROR_CATALOG,
  getCommonErrorCatalogEntryByStatus,
} from '@/shared/api/errorCatalog'

const EXPECTED_ERROR_CODES = [
  'AUTH-001',
  'AUTH-002',
  'AUTH-003',
  'AUTH-004',
  'AUTH-005',
  'AUTH-006',
  'AUTH-007',
  'AUTH-008',
  'AUTH-009',
  'COMMON-400',
  'COMMON-401',
  'COMMON-403',
  'COMMON-404',
  'COMMON-405',
  'COMMON-409',
  'COMMON-415',
  'COMMON-500',
  'MAGAZINE-001',
  'POINT-001',
  'POINT-002',
  'POINT-003',
  'POINT-004',
  'RESERVATION-001',
  'RESERVATION-002',
  'RESERVATION-003',
  'RESERVATION-004',
  'RESERVATION-005',
  'RESERVATION-006',
  'RESERVATION-007',
  'RESTAURANT-001',
  'RESTAURANT-002',
  'RESTAURANT-003',
  'RESTAURANT-004',
  'RESTAURANT-005',
  'RESTAURANT-006',
  'REVIEW-001',
  'REVIEW-002',
  'REVIEW-003',
  'REVIEW-004',
  'REVIEW-005',
  'REVIEW-006',
  'REVIEW-007',
  'UPLOAD-001',
  'UPLOAD-002',
  'UPLOAD-003',
  'USER-001',
  'USER-002',
  'USER-003',
  'USER-004',
  'USER-005',
]

describe('ERROR_CATALOG', () => {
  it('contains every HASHI-104 external error code exactly once', () => {
    expect(Object.keys(ERROR_CATALOG).sort()).toEqual(EXPECTED_ERROR_CODES)
  })

  it('preserves agreed status, copy, and punctuation', () => {
    expect(ERROR_CATALOG['COMMON-409']).toEqual({
      status: 409,
      message: '요청이 겹쳤습니다. 잠시 후 다시 시도해주세요',
    })
    expect(ERROR_CATALOG['RESTAURANT-006']).toEqual({
      status: 400,
      message:
        '영업시간 정보가 올바르지 않습니다. 모든 요일을 중복 없이 포함하고 시간 규칙을 지켜야 합니다.',
    })
    expect(ERROR_CATALOG['AUTH-007']).toEqual({
      status: 502,
      message: '카카오 서버와 통신할 수 없습니다',
    })
    expect(ERROR_CATALOG['MAGAZINE-001']).toEqual({
      status: 404,
      message: '매거진을 찾을 수 없습니다.',
    })
  })

  it('resolves a common fallback from an HTTP status', () => {
    expect(getCommonErrorCatalogEntryByStatus(404)).toEqual({
      code: 'COMMON-404',
      status: 404,
      message: '리소스를 찾을 수 없습니다',
    })
    expect(getCommonErrorCatalogEntryByStatus(502)).toBeUndefined()
  })
})
