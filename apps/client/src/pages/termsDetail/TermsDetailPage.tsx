import { BackIcon } from '@hashi/hds-icons'
import { Accordion, Header, IconButton } from '@hashi/hds-ui'
import { useNavigate, useParams } from 'react-router-dom'

import { findTermsPolicy } from '@/features/terms/constants/termsPolicies'
import { NotFoundPage } from '@/pages/notFound'
import { TermsClauseContent } from '@/pages/termsDetail/components/TermsClauseContent'

const formatLastUpdatedDate = (effectiveDate: string) =>
  effectiveDate.split('.').join('. ')

export const TermsDetailPage = () => {
  const navigate = useNavigate()
  const params = useParams<{ policyId: string }>()
  const policy = findTermsPolicy(params.policyId)

  if (!policy) {
    return <NotFoundPage />
  }

  return (
    <div className="min-h-dvh bg-white pt-18.75">
      <Header
        className="app-mobile-fixed-top z-fixed fixed"
        leftAction={
          <IconButton
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
            size="xs"
          >
            <BackIcon className="size-6" />
          </IconButton>
        }
        subtitle={`최종 업데이트: ${formatLastUpdatedDate(policy.effectiveDate)}`}
        title={policy.title}
      />

      <ul>
        {policy.clauses.map((clause) => (
          <li key={clause.title}>
            <Accordion
              contentClassName="typo-body-5 text-cool-gray-500 leading-[1.5]"
              headingLevel={2}
              title={clause.title}
            >
              <TermsClauseContent blocks={clause.blocks} />
            </Accordion>
          </li>
        ))}
      </ul>
    </div>
  )
}
