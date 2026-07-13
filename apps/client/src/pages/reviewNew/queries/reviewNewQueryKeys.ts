export const reviewNewQueryKeys = {
  all: ['reviewNew'] as const,
  contexts: () => [...reviewNewQueryKeys.all, 'context'] as const,
  context: (reservationId: number) =>
    [...reviewNewQueryKeys.contexts(), reservationId] as const,
}
