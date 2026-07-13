export interface WritableReview {
  id: string
  reservationId: string
  restaurantId: string
  restaurantName: string
  thumbnailUrl?: string
  visitedAt: string
  guestSummary: string
}

export interface WrittenReview {
  id: string
  restaurantName: string
  thumbnailUrl?: string
  visitedAt: string
  rating: number
}
