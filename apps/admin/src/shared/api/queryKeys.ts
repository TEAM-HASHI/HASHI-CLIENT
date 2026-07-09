export const adminQueryKeys = {
  dashboard: ['admin', 'dashboard'] as const,
  restaurants: ['admin', 'restaurants'] as const,
  reservations: ['admin', 'reservations'] as const,
  reservationUser: (reservationId: string) =>
    ['admin', 'reservations', reservationId, 'user'] as const,
  magazines: ['admin', 'magazines'] as const,
}
