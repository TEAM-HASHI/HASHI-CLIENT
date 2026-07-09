import { clearAdminSession, setAdminSession } from '@/shared/auth/adminSession'
import type {
  AdminLoginRequest,
  AdminReservationStatus,
  MagazineFormData,
  MockScenario,
  RestaurantFormData,
} from '@/shared/api/adminTypes'
import { mockStore } from '@/shared/api/mock/mockStore'

const LOGIN_DELAY_MS = 240

const waitForLoginDelay = () =>
  new Promise((resolve) => {
    window.setTimeout(resolve, LOGIN_DELAY_MS)
  })

export const adminService = {
  async login({ email, password }: AdminLoginRequest) {
    await waitForLoginDelay()

    if (password.toLowerCase() === 'fail') {
      throw new Error('관리자 계정 정보를 확인해주세요.')
    }

    const session = {
      token: `mock-admin-token-${Date.now()}`,
      email,
      name: '최고관리자',
      issuedAt: new Date().toISOString(),
    }

    setAdminSession(session)
    return session
  },
  async logout() {
    await waitForLoginDelay()
    clearAdminSession()
  },
  getDashboardMetrics() {
    return mockStore.getDashboardMetrics()
  },
  listRestaurants(scenario: MockScenario) {
    return mockStore.listRestaurants(scenario)
  },
  createRestaurant(input: RestaurantFormData) {
    return mockStore.createRestaurant(input)
  },
  updateRestaurant(restaurantId: string, input: RestaurantFormData) {
    return mockStore.updateRestaurant(restaurantId, input)
  },
  deleteRestaurant(restaurantId: string) {
    return mockStore.deleteRestaurant(restaurantId)
  },
  listReservations(scenario: MockScenario) {
    return mockStore.listReservations(scenario)
  },
  updateReservationStatus(
    reservationId: string,
    status: AdminReservationStatus,
  ) {
    return mockStore.updateReservationStatus(reservationId, status)
  },
  getReservationUser(reservationId: string) {
    return mockStore.getReservationUser(reservationId)
  },
  listMagazines(scenario: MockScenario) {
    return mockStore.listMagazines(scenario)
  },
  createMagazine(input: MagazineFormData) {
    return mockStore.createMagazine(input)
  },
  updateMagazine(magazineId: string, input: MagazineFormData) {
    return mockStore.updateMagazine(magazineId, input)
  },
  deleteMagazine(magazineId: string) {
    return mockStore.deleteMagazine(magazineId)
  },
}
