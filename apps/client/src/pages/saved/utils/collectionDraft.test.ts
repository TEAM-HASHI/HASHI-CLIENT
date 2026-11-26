import { describe, expect, it } from 'vitest'

import {
  normalizeCollectionDraft,
  validateCollection,
} from '@/pages/saved/utils/collectionDraft'

const draft = {
  name: '여행',
  description: '',
  color: 'red' as const,
  isPublic: true,
}
const collections = [{ id: '8', name: '여행' }]

describe('컬렉션 입력 검증', () => {
  it('설명 개행을 공백으로 바꾼 뒤 공백을 포함한 30자 제한을 적용한다', () => {
    const description = '가'.repeat(14) + '\r\n' + '나'.repeat(15)
    expect(validateCollection({ ...draft, description }, [])).toBeNull()
    expect(
      normalizeCollectionDraft({ ...draft, description }).description,
    ).toBe('가'.repeat(14) + ' ' + '나'.repeat(15))
    expect(
      validateCollection({ ...draft, description: description + '나' }, []),
    ).toBe('descriptionLength')
  })

  it('이름, 색상, 글자 수와 중복을 검증하고 수정 대상은 제외한다', () => {
    expect(validateCollection({ ...draft, name: ' ' }, [])).toBe('name')
    expect(validateCollection({ ...draft, color: null }, [])).toBe('color')
    expect(
      validateCollection({ ...draft, name: ' ' + '가'.repeat(20) }, []),
    ).toBe('nameLength')
    expect(validateCollection({ ...draft, name: ' 여행 ' }, collections)).toBe(
      'duplicate',
    )
    expect(validateCollection(draft, collections, '8')).toBeNull()
  })

  it.each(['\u00a0', '\u3000', '\u0085', '\u001c'])(
    '서버 경계 공백 %j를 제거하고 내부 공백은 보존한다',
    (space) => {
      expect(
        normalizeCollectionDraft({
          ...draft,
          name: space + '새  여행' + space,
          description: space + '설  명' + space,
        }),
      ).toEqual({ ...draft, name: '새  여행', description: '설  명' })
      expect(validateCollection({ ...draft, name: space }, [])).toBe('name')
    },
  )

  it('경계의 BOM은 보존하고 공백뿐인 설명은 비운다', () => {
    expect(
      normalizeCollectionDraft({
        ...draft,
        name: '\ufeff여행\ufeff',
        description: ' \u3000 ',
      }),
    ).toEqual({ ...draft, name: '\ufeff여행\ufeff', description: '' })
  })
})
