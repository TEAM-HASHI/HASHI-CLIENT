export type ReservationProgressStatus = 'completed' | 'current' | 'pending'

export type ReservationProgressStepId = 'received' | 'contacting' | 'confirmed'

export interface ReservationProgressStep {
  id: ReservationProgressStepId
  title: string
  description: string
  requestedAt?: string
  status: ReservationProgressStatus
}

export type { ReservationReceiptInfoItem } from '@/features/reservation/utils/createReservationReceiptInfoItems'
