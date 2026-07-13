export const pointQueryKeys = {
  all: ['point'] as const,
  myBalance: () => [...pointQueryKeys.all, 'myBalance'] as const,
}
