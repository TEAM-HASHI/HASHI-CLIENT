export const noticeQueryKeys = {
  all: ['notices'] as const,
  infiniteList: () => [...noticeQueryKeys.all, 'infiniteList'] as const,
  detail: (noticeId: number | null) =>
    [...noticeQueryKeys.all, 'detail', noticeId] as const,
}
