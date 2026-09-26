import type { NoticeSummary } from '@/features/notice/types'

export const formatNoticeDate = (value: string) => {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)

  return dateParts ? `${dateParts[1]}.${dateParts[2]}.${dateParts[3]}` : ''
}

export const formatNoticeLastUpdatedDate = ({
  publishedAt,
  updatedAt,
}: Pick<NoticeSummary, 'publishedAt' | 'updatedAt'>) =>
  formatNoticeDate(updatedAt ?? publishedAt)
