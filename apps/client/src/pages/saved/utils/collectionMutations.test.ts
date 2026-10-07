import { describe, expect, it } from 'vitest'
import { collectionMocks } from '@/pages/saved/data/collectionMocks'
import {
  createCollection,
  updateCollection,
  saveRestaurant,
  validateCollection,
} from '@/pages/saved/utils/collectionMutations'

const draft = {
  name: '  새 여행  ',
  description: '  설명  ',
  color: 'red' as const,
  isPublic: true,
}
describe('컬렉션 목 데이터 변경', () => {
  it('생성은 공백을 유지하고 수정은 제거하며 원본을 변경하지 않는다', () => {
    const created = createCollection(
      collectionMocks,
      draft,
      'new',
      '2026-10-08T00:00:00Z',
    )
    expect(created.collections[0].name).toBe(draft.name)
    expect(created.collections[0].description).toBe(draft.description)
    expect(created.collections[0].restaurants).toEqual([])
    const updated = updateCollection(created, 'new', draft)
    expect(updated.collections[0].name).toBe('새 여행')
    expect(updated.collections[0].description).toBe('설명')
    expect(collectionMocks.collections).toHaveLength(4)
  })
  it('공백 이름·미선택 색상·중복·길이 초과를 거절하고 수정 자기 자신은 제외한다', () => {
    expect(
      validateCollection(
        { ...draft, name: '   ' },
        collectionMocks.collections,
      ),
    ).toBe('name')
    expect(
      validateCollection(
        { ...draft, color: null },
        collectionMocks.collections,
      ),
    ).toBe('color')
    expect(
      validateCollection(
        { ...draft, name: '가'.repeat(21) },
        collectionMocks.collections,
      ),
    ).toBe('nameLength')
    expect(
      validateCollection(
        { ...draft, description: '가'.repeat(101) },
        collectionMocks.collections,
      ),
    ).toBe('descriptionLength')
    const existing = collectionMocks.collections[0]
    expect(
      validateCollection(
        { ...draft, name: existing.name },
        collectionMocks.collections,
      ),
    ).toBe('duplicate')
    expect(
      validateCollection(existing, collectionMocks.collections, existing.id),
    ).toBeNull()
    expect(
      validateCollection(
        { ...draft, name: ` ${existing.name} ` },
        collectionMocks.collections,
        'other',
      ),
    ).toBe('duplicate')
  })
  it('같은 식당의 중복 저장과 없는 대상을 방지하고 다른 컬렉션 저장은 허용한다', () => {
    const saved = saveRestaurant(
      collectionMocks,
      'autumn',
      'sushi',
      '2026-10-08T00:00:00Z',
    )
    expect(
      saved.collections.find((c) => c.id === 'autumn')?.restaurants,
    ).toHaveLength(1)
    expect(saveRestaurant(saved, 'autumn', 'sushi', 'later')).toBe(saved)
    expect(saveRestaurant(saved, 'missing', 'sushi', 'later')).toBe(saved)
    expect(saveRestaurant(saved, 'autumn', 'missing', 'later')).toBe(saved)
    expect(
      collectionMocks.collections.find((c) => c.id === 'autumn')?.restaurants,
    ).toHaveLength(0)
  })
})
