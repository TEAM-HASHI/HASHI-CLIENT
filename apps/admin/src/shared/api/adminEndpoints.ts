export const ADMIN_ENDPOINTS = {
  login: '/api/v1/auth/admin/login',
  logout: '/api/v1/auth/admin/logout',
  presignedUpload: '/api/v1/uploads/presigned-urls',
  publicRestaurants: '/api/v1/restaurants',
  publicRestaurantSummary: (restaurantId: string | number) =>
    `/api/v1/restaurants/${restaurantId}/summary`,
  publicRestaurantStoreInformation: (restaurantId: string | number) =>
    `/api/v1/restaurants/${restaurantId}/store-information`,
  publicRestaurantMenus: (restaurantId: string | number) =>
    `/api/v1/restaurants/${restaurantId}/menus`,
  publicMagazines: '/api/v1/magazines',
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
