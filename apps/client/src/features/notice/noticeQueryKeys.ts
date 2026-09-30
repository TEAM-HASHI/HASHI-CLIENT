export const noticeQueryKeys = {
  all: ['notices'] as const,
  infiniteList: (size: number) =>
    [...noticeQueryKeys.all, 'infiniteList', size] as const,
  detail: (noticeId: number | null) =>
    [...noticeQueryKeys.all, 'detail', noticeId] as const,
}
