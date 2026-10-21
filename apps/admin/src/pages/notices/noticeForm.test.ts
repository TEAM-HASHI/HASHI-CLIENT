import { describe, expect, it } from 'vitest'
import { createNoticeDraft, validateNotice } from '@/pages/notices/noticeForm'

describe('notice input contract', () => {
  it('preserves mixed formatting, line breaks and attachment order when editing', () => {
    const notice = {
      title: '기존 공지',
      body: [
        {
          type: 'PARAGRAPH' as const,
          items: [
            [
              { text: '첫 줄\n', bold: true },
              { text: '자세히', href: '/terms' },
            ],
          ],
        },
      ],
      images: [{ assetId: 'second' }, { assetId: 'first' }],
    }
    expect(createNoticeDraft(notice)).toEqual({
      title: '기존 공지',
      body: notice.body,
      imageAssetIds: ['second', 'first'],
    })
    expect(validateNotice(createNoticeDraft(notice))).toBeUndefined()
  })

  it.each([
    'javascript:alert(1)',
    '//other.example',
    '/\\other.example',
    'https://user:pass@example.com',
    '/path with space',
  ])('rejects unsafe links without rewriting the draft: %s', (href) => {
    const draft = {
      title: '공지',
      body: [{ type: 'PARAGRAPH' as const, items: [[{ text: '링크', href }]] }],
      imageAssetIds: [],
    }
    expect(validateNotice(draft)).toMatch(/링크/)
    expect(draft.body[0].items[0][0].href).toBe(href)
  })

  it('rejects blank-only content and duplicate attachments before saving', () => {
    const draft = createNoticeDraft()
    draft.title = '공지'
    draft.body[0].items = [[{ text: '  \n' }]]
    expect(validateNotice(draft)).toMatch(/본문/)
    draft.body[0].items = [[{ text: '내용' }]]
    draft.imageAssetIds = ['same', 'same']
    expect(validateNotice(draft)).toMatch(/이미지/)
  })
})
