export const termsQueryKeys = {
  all: ['terms'] as const,
  list: () => [...termsQueryKeys.all, 'list'] as const,
  detail: (termsId: number | null) =>
    [...termsQueryKeys.all, 'detail', termsId] as const,
}
