import type { MapSessionSnapshot } from '@/pages/map/types'

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null
const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)
const oneOf = (value: unknown, values: readonly unknown[]) =>
  values.includes(value)
const optional = (value: unknown, check: (value: unknown) => boolean) =>
  value === undefined || check(value)
const text = (value: unknown) => typeof value === 'string'
const texts = (value: unknown) => Array.isArray(value) && value.every(text)
const position = (value: unknown) =>
  record(value) &&
  finite(value.lat) &&
  finite(value.lng) &&
  Math.abs(value.lat) <= 90 &&
  Math.abs(value.lng) <= 180
const bounds = (value: unknown) =>
  record(value) &&
  [value.north, value.south, value.east, value.west].every(finite) &&
  Number(value.north) >= Number(value.south) &&
  Number(value.north) <= 90 &&
  Number(value.south) >= -90 &&
  Number(value.east) >= Number(value.west) &&
  Number(value.east) <= 180 &&
  Number(value.west) >= -180
const camera = (value: unknown) =>
  value === null ||
  (record(value) &&
    position(value.center) &&
    finite(value.zoom) &&
    bounds(value.bounds) &&
    optional(value.minZoom, finite))
const stage = (value: unknown) =>
  oneOf(value, ['collapsed', 'normal', 'expanded'])
const category = (value: unknown) => oneOf(value, ['restaurant', 'bar', 'cafe'])
const attributions = (value: unknown) =>
  Array.isArray(value) &&
  value.every(
    (item) => record(item) && text(item.displayName) && text(item.uri),
  )
const restaurant = (value: unknown) =>
  record(value) &&
  [
    'id',
    'name',
    'areaCode',
    'cuisine',
    'hours',
    'price',
    'description',
    'address',
  ].every((key) => text(value[key])) &&
  category(value.category) &&
  [value.rating, value.reviewCount, value.recommendationRank].every(finite) &&
  texts(value.menuKeywords) &&
  texts(value.images) &&
  position(value.position) &&
  optional(value.validUntil, text) &&
  optional(value.attributions, attributions) &&
  optional(value.saveCount, finite) &&
  optional(value.saved, (value) => typeof value === 'boolean')
const query = (value: unknown) =>
  record(value) &&
  bounds(value) &&
  oneOf(value.sort, ['recommend', 'rating', 'reviews']) &&
  optional(value.mapRegionId, finite) &&
  optional(value.keyword, text) &&
  optional(value.genre, text) &&
  optional(value.placeType, category)
const pageRequest = (value: unknown) =>
  value === null ||
  (record(value) &&
    ((text(value.cursor) && Object.keys(value).length === 1) ||
      (text(value.querySessionId) &&
        oneOf(value.sort, ['recommend', 'rating', 'reviews']) &&
        Object.keys(value).length === 2) ||
      query(value)))
const page = (value: unknown) =>
  record(value) &&
  Array.isArray(value.restaurants) &&
  value.restaurants.every(restaurant) &&
  typeof value.hasNext === 'boolean' &&
  optional(value.nextCursor, text) &&
  text(value.querySessionId) &&
  text(value.expiresAt) &&
  text(value.rankingAsOf) &&
  query(value.query) &&
  optional(
    value.searchResult,
    (result) =>
      record(result) &&
      finite(result.totalCount) &&
      (result.bounds === null || bounds(result.bounds)),
  )

// Storage is an untrusted, versioned boundary, not a general cache hydration API.
const checkMapOAuthSnapshot = (value: unknown): value is MapSessionSnapshot => {
  if (!record(value) || !record(value.conditions)) return false
  const conditions = value.conditions
  if (
    !(
      text(conditions.keyword) &&
      (conditions.category === 'all' || category(conditions.category)) &&
      oneOf(conditions.sort, ['recommended', 'rating', 'reviews']) &&
      (conditions.areaCode === null || text(conditions.areaCode)) &&
      (value.searchBounds === null || bounds(value.searchBounds)) &&
      camera(value.camera) &&
      (value.selectedId === null || text(value.selectedId)) &&
      typeof value.isExploring === 'boolean' &&
      stage(value.stage) &&
      stage(value.detailStage)
    )
  )
    return false
  if (
    !(
      optional(value.detailTab, (tab) =>
        oneOf(tab, ['info', 'menu', 'photo', 'review']),
      ) &&
      optional(value.detailScrollTop, (top) => finite(top) && top >= 0) &&
      optional(value.detailReviewSort, (sort) =>
        oneOf(sort, ['latest', 'rating-high', 'rating-low']),
      ) &&
      optional(value.selectionCamera, camera) &&
      optional(value.selectionStage, stage) &&
      optional(
        value.selectionIsExploring,
        (exploring) => typeof exploring === 'boolean',
      ) &&
      optional(value.emptyKind, (kind) =>
        oneOf(kind, ['region', 'conditions']),
      ) &&
      optional(value.nextCursor, text)
    )
  )
    return false
  return optional(
    value.queryData,
    (data) =>
      record(data) &&
      Array.isArray(data.pages) &&
      data.pages.every(page) &&
      Array.isArray(data.pageParams) &&
      data.pageParams.length === data.pages.length &&
      data.pageParams.every(pageRequest),
  )
}

export const parseMapOAuthSnapshot = (
  value: unknown,
): MapSessionSnapshot | null => {
  if (!checkMapOAuthSnapshot(value)) return null
  // Only known UI/cache fields cross the boundary. No modal or mutation intent.
  return {
    conditions: {
      keyword: value.conditions.keyword,
      category: value.conditions.category,
      sort: value.conditions.sort,
      areaCode: value.conditions.areaCode,
    },
    camera: value.camera,
    searchBounds: value.searchBounds,
    selectedId: value.selectedId,
    isExploring: value.isExploring,
    stage: value.stage,
    detailStage: value.detailStage,
    detailTab: value.detailTab,
    detailScrollTop: value.detailScrollTop,
    detailReviewSort: value.detailReviewSort,
    selectionCamera: value.selectionCamera,
    selectionStage: value.selectionStage,
    selectionIsExploring: value.selectionIsExploring,
    emptyKind: value.emptyKind,
    nextCursor: value.nextCursor,
    queryData: value.queryData,
  }
}
