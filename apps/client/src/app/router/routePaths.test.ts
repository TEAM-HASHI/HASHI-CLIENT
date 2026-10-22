import { describe, expect, it } from 'vitest'

import {
  getNoticeDetailPath,
  getReservationCompletePath,
  getReservationDetailPath,
  getRestaurantDetailPath,
  getCollectionDetailPath,
  getCollectionEditPath,
  getRestaurantMenuDetailPath,
  getRestaurantReservationNewPath,
  getRestaurantReviewNewPath,
  getTermsDetailPath,
} from '@/app/router/routePaths'

describe('routePaths', () => {
  it('컬렉션 원본 ID를 경로에 안전하게 인코딩한다', () => {
    expect(getCollectionDetailPath('도쿄/여행')).toBe(
      '/saved/collections/%EB%8F%84%EC%BF%84%2F%EC%97%AC%ED%96%89',
    )
    expect(getCollectionEditPath('spring')).toBe(
      '/saved/collections/spring/edit',
    )
  })
  it('creates an encoded restaurant detail path from a raw id', () => {
    expect(getRestaurantDetailPath('tokyo/sushi 한글')).toBe(
      '/restaurants/tokyo%2Fsushi%20%ED%95%9C%EA%B8%80',
    )
  })

  it('creates an encoded restaurant menu detail path from raw ids', () => {
    expect(getRestaurantMenuDetailPath('tokyo/sushi', 'menu?1')).toBe(
      '/restaurants/tokyo%2Fsushi/menus/menu%3F1',
    )
  })

  it('creates reservation and review paths from raw ids', () => {
    expect(getRestaurantReservationNewPath('tokyo/sushi')).toBe(
      '/restaurants/tokyo%2Fsushi/reservations/new',
    )
    expect(getRestaurantReviewNewPath('tokyo/sushi', 'reservation/1')).toBe(
      '/restaurants/tokyo%2Fsushi/reviews/new?reservationId=reservation%2F1',
    )
  })

  it('creates a notice detail path from a raw id', () => {
    expect(getNoticeDetailPath('3')).toBe('/notices/3')
  })

  it('creates an encoded reservation detail path from a raw id', () => {
    expect(getReservationDetailPath('reservation/31')).toBe(
      '/reservations/reservation%2F31',
    )
  })

  it('creates an encoded reservation complete path from a raw id', () => {
    expect(getReservationCompletePath('reservation/31')).toBe(
      '/reservations/reservation%2F31/complete',
    )
  })

  it('creates an encoded terms detail path from a policy id', () => {
    expect(getTermsDetailPath('hashi terms')).toBe('/terms/hashi%20terms')
  })
})
