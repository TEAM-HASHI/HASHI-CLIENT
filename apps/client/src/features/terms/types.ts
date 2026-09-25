export type TermsPolicyId =
  | 'hashi-terms'
  | 'privacy-policy'
  | 'privacy-consent'
  | 'third-party-consent'
  | 'refund-policy'
  | 'review-policy'
  | 'point-terms'
  | 'service-policy'

export interface TermsListItem {
  text: string
  children?: TermsList
}

export interface TermsList {
  ordered: boolean
  items: TermsListItem[]
}

export type TermsContentBlock =
  | { type: 'paragraph'; text: string }
  | ({ type: 'list' } & TermsList)

export interface TermsClause {
  title: string
  blocks: TermsContentBlock[]
}

export interface TermsPolicy {
  id: TermsPolicyId
  title: string
  effectiveDate: string
  clauses: TermsClause[]
}
