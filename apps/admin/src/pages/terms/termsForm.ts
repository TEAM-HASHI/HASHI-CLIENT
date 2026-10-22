import type {
  AdminTerms,
  SaveTerms,
  TermsType,
} from '@/pages/terms/api/termsApi'

export interface TermsDraft extends Omit<SaveTerms, 'clauses'> {
  clauses: { key: string; heading: string; content: string }[]
}

export const createTermsDraft = (
  type: TermsType,
  terms?: AdminTerms,
): TermsDraft => ({
  type: terms?.type ?? type,
  title: terms?.title ?? '',
  version: terms?.version ?? '',
  effectiveDate: terms?.effectiveDate ?? '',
  clauses: (terms?.clauses ?? [{ heading: '', content: '' }]).map((clause) => ({
    key: crypto.randomUUID(),
    heading: clause.heading ?? '',
    content: clause.content ?? '',
  })),
})

export const toTermsRequest = (draft: TermsDraft): SaveTerms => ({
  type: draft.type,
  title: draft.title,
  version: draft.version,
  effectiveDate: draft.effectiveDate,
  clauses: draft.clauses.map(({ heading, content }) => ({ heading, content })),
})

export const validateTerms = (body: SaveTerms): string | undefined => {
  if (!body.title.trim() || body.title.length > 100)
    return '제목은 공백만으로 작성할 수 없으며 100자 이하여야 합니다.'
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,49}$/.test(body.version))
    return '버전은 영문 또는 숫자로 시작하고 영문, 숫자, 점, 밑줄, 하이픈으로 50자 이내여야 합니다.'
  const date = new Date(`${body.effectiveDate}T00:00:00Z`)
  if (
    !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(body.effectiveDate) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== body.effectiveDate
  )
    return '시행일을 1000년부터 9999년 사이의 올바른 날짜로 입력해주세요.'
  if (!body.clauses.length || body.clauses.length > 200)
    return '조항은 1개 이상 200개 이하로 작성해주세요.'
  let length = 0
  for (const { heading, content } of body.clauses) {
    if (!heading?.trim() || heading.length > 100 || !content?.trim())
      return '각 조항의 제목은 100자 이하로, 제목과 내용 모두 공백이 아닌 내용을 입력해주세요.'
    length += heading.length + content.length
  }
  if (length > 100_000)
    return '조항 제목과 내용의 합계는 100,000자 이하여야 합니다.'
}

export const termsErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : '요청을 처리하지 못했습니다. 다시 시도해주세요.'

export const termsStatusLabel = (status?: string) => {
  switch (status) {
    case 'DRAFT':
      return '초안'
    case 'CURRENT':
      return '현재 적용'
    case 'ARCHIVED':
      return '보관'
    default:
      return '상태 확인 필요'
  }
}
