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
  it('생성과 수정 모두 앞뒤 공백을 제거하며 원본을 변경하지 않는다', () => {
    const created = createCollection(
      collectionMocks,
      draft,
      'new',
      '2026-10-08T00:00:00Z',
    )
    expect(created.collections[0].name).toBe('새 여행')
    expect(created.collections[0].description).toBe('설명')
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
  it('색상 수정과 함께 서버 기준 이름과 설명을 저장한다', () => {
    const created = createCollection(
      collectionMocks,
      draft,
      'spaced',
      '2026-10-18T00:00:00Z',
    )
    const updated = updateCollection(created, 'spaced', {
      ...draft,
      color: 'blue',
    })
    expect(updated.collections[0]).toMatchObject({
      name: '새 여행',
      description: '설명',
      color: 'blue',
    })
    expect(
      validateCollection({ ...draft, name: '새 여행' }, created.collections),
    ).toBe('duplicate')
  })
  it.each(['\u00a0', '\u3000', '\u0085', '\u001c'])(
    '서버가 제거하는 경계 공백 %j를 정규화하고 내부 공백은 보존한다',
    (space) => {
      const created = createCollection(
        collectionMocks,
        {
          ...draft,
          name: `${space}새  여행${space}`,
          description: `${space}설  명${space}`,
        },
        'unicode',
        'now',
      )
      expect(created.collections[0]).toMatchObject({
        name: '새  여행',
        description: '설  명',
      })
      expect(validateCollection({ ...draft, name: space }, [])).toBe('name')
    },
  )
  it('서버가 공백으로 취급하지 않는 BOM은 보존한다', () => {
    const created = createCollection(
      collectionMocks,
      { ...draft, name: '\ufeff여행\ufeff' },
      'bom',
      'now',
    )
    expect(created.collections[0].name).toBe('\ufeff여행\ufeff')
  })
  it('길이 검증은 공백 제거 전에 적용하고 공백뿐인 설명은 비운다', () => {
    expect(
      validateCollection({ ...draft, name: ' ' + '가'.repeat(20) }, []),
    ).toBe('nameLength')
    expect(
      validateCollection({ ...draft, description: ' ' + '가'.repeat(100) }, []),
    ).toBe('descriptionLength')
    const created = createCollection(
      collectionMocks,
      { ...draft, description: ' \u3000 ' },
      'empty',
      'now',
    )
    expect(created.collections[0].description).toBe('')
    const updated = updateCollection(created, 'empty', {
      ...draft,
      description: ' \u00a0 ',
    })
    expect(updated.collections[0].description).toBe('')
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
