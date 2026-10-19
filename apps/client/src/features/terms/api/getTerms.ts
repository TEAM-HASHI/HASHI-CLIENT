import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

export type TermsSummary = Required<
  components['schemas']['TermsSummaryResponse']
>
export type TermsDetail = Required<
  Omit<components['schemas']['TermsResponse'], 'clauses'>
> & {
  clauses: Required<components['schemas']['TermsClause']>[]
}

export const getTerms = async () => {
  const data = await request<TermsSummary[]>('/api/v1/terms')
  if (!data) throw new Error('Terms list response data is empty')
  return data
}

export const getTermsDetail = async (termsId: number) => {
  const data = await request<TermsDetail>(`/api/v1/terms/${termsId}`)
  if (!data) throw new Error('Terms detail response data is empty')
  return data
}
