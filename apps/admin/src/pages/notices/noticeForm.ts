import type { components } from '@/shared/api/generated/notice-openapi'
import type { AdminNotice, SaveNotice } from '@/pages/notices/api/noticeApi'

export type NoticeSpan = components['schemas']['Span'] & { text: string }
export type NoticeBlock = {
  type: NonNullable<components['schemas']['NoticeBlock']['type']>
  items: NoticeSpan[][]
}
export type NoticeDraft = Omit<SaveNotice, 'body'> & { body: NoticeBlock[] }

export const createNoticeDraft = (notice?: AdminNotice): NoticeDraft => ({
  title: notice?.title ?? '',
  body: notice?.body?.map((block) => ({
    type: block.type ?? 'PARAGRAPH',
    items: (block.items ?? []).map((item) =>
      item.map((span) => ({ ...span, text: span.text ?? '' })),
    ),
  })) ?? [{ type: 'PARAGRAPH', items: [[{ text: '' }]] }],
  imageAssetIds: (notice?.images ?? []).map(({ assetId }) => {
    if (!assetId) throw new Error('첨부 이미지 식별자가 없습니다.')
    return assetId
  }),
})

const isSafeLink = (href: string) => {
  if (
    href.length > 2000 ||
    href.includes('\\') ||
    Array.from(href).some(
      (character) =>
        character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127,
    )
  )
    return false
  if (href.startsWith('/') && !href.startsWith('//')) return true
  try {
    const url = new URL(href)
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
}

export const validateNotice = (draft: NoticeDraft): string | undefined => {
  if (!draft.title.trim() || draft.title.length > 100)
    return '제목은 공백만으로 작성할 수 없으며 100자 이하여야 합니다.'
  if (!draft.body.length || draft.body.length > 1000)
    return '본문은 1개 이상 1000개 이하의 문단으로 작성해주세요.'
  let length = 0
  let hasText = false
  for (const block of draft.body) {
    if (
      !block.items.length ||
      block.items.length > 1000 ||
      (block.type === 'PARAGRAPH' && block.items.length !== 1)
    )
      return '본문 문단과 목록 구성을 확인해주세요.'
    for (const item of block.items) {
      if (!item.length || item.length > 1000)
        return '본문 텍스트를 입력해주세요.'
      for (const span of item) {
        if (!span.text.length)
          return '비어 있는 본문 텍스트를 입력하거나 제거해주세요.'
        length += span.text.length
        hasText ||= Boolean(span.text.trim())
        if (span.href != null && !isSafeLink(span.href))
          return '링크는 안전한 http(s) URL 또는 /로 시작하는 내부 경로를 입력해주세요.'
      }
    }
  }
  if (!hasText || length > 10000)
    return '본문은 공백을 제외한 내용이 있어야 하며 전체 10000자 이하여야 합니다.'
  if (
    draft.imageAssetIds.length > 10 ||
    new Set(draft.imageAssetIds).size !== draft.imageAssetIds.length
  )
    return '첨부 이미지는 중복 없이 최대 10장까지 등록해주세요.'
}

export const noticeErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : '요청을 처리하지 못했습니다. 다시 시도해주세요.'
