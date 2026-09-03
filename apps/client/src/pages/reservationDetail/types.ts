export type ReservationProgressStatus = 'completed' | 'current' | 'pending'

export interface ReservationProgressStep {
  id: string
  title: string
  description: string
  requestedAt?: string
  status: ReservationProgressStatus
}

export interface ReservationReceiptInfoItem {
  label: string
  value: string
}
