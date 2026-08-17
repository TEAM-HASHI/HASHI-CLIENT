import { describe, expect, it } from 'vitest'

import {
  createSearchUrlParams,
  parseSearchUrlState,
} from '@/pages/search/utils/searchUrlState'

describe('searchUrlState', () => {
  it('normalizes a search URL into the applied search state', () => {
    expect(
      parseSearchUrlState(
        new URLSearchParams({
          category: 'sushiSashimi',
          keyword: '  스시  ',
          sort: 'rating',
        }),
      ),
    ).toEqual({
      category: 'sushiSashimi',
      keyword: '스시',
      sort: 'rating',
    })
  })

  it('falls back to defaults when URL filter values are unsupported', () => {
    expect(
      parseSearchUrlState(
        new URLSearchParams({
          category: 'unknown-category',
          keyword: '라멘',
          sort: 'unknown-sort',
        }),
      ),
    ).toEqual({
      category: 'all',
      keyword: '라멘',
      sort: 'default',
    })
  })

  it('omits default filters and clears every filter when keyword is empty', () => {
    expect(
      createSearchUrlParams({
        category: 'all',
        keyword: '  라멘  ',
        sort: 'default',
      }).toString(),
    ).toBe('keyword=%EB%9D%BC%EB%A9%98')

    expect(
      createSearchUrlParams({
        category: 'sushiSashimi',
        keyword: '   ',
        sort: 'rating',
      }).toString(),
    ).toBe('')
  })
})
