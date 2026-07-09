export const ADMIN_ENDPOINTS = {
  login: '/api/v1/auth/admin/login',
  logout: '/api/v1/auth/admin/logout',
  restaurants: '/api/v1/admin/restaurants',
  restaurant: (restaurantId: string | number) =>
    `/api/v1/admin/restaurants/${restaurantId}`,
  reservations: '/api/v1/admin/reservations',
  reservationStatus: (reservationId: string | number) =>
    `/api/v1/admin/reservations/${reservationId}/status`,
  reservationUser: (reservationId: string | number) =>
    `/api/v1/admin/reservations/${reservationId}/user`,
  magazines: '/api/v1/admin/magazines',
  magazine: (magazineId: string | number) =>
    `/api/v1/admin/magazines/${magazineId}`,
} as const
