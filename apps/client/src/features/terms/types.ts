import type { components } from '@/shared/api/generated/openapi'

export type TermsSummary = Required<
  components['schemas']['TermsSummaryResponse']
>
export type TermsDetail = Required<
  Omit<components['schemas']['TermsResponse'], 'clauses'>
> & {
  clauses: Required<components['schemas']['TermsClause']>[]
}
