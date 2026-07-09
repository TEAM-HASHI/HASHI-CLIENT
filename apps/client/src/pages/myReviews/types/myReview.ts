export interface WritableReview {
  id: string
  restaurantId: string
  restaurantName: string
  visitedAt: string
  guestSummary: string
}

export interface WrittenReview {
  id: string
  restaurantName: string
  visitedAt: string
  rating: number
}
