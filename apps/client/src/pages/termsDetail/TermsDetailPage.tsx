import { BackIcon } from '@hashi/hds-icons'
import { Accordion, Header, IconButton } from '@hashi/hds-ui'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getTermsDetail } from '@/features/terms/api/getTerms'
import { termsQueryKeys } from '@/features/terms/queries/termsQueryKeys'
import { checkIsNotFoundError } from '@/shared/api/apiError'
import { LoadingScreen } from '@/shared/components/loadingScreen'
import { NotFoundPage } from '@/pages/notFound'

const formatLastUpdatedDate = (effectiveDate: string) =>
  effectiveDate.replaceAll('-', '. ')

export const TermsDetailPage = () => {
  const navigate = useNavigate()
  const params = useParams<{ policyId: string }>()
  const id = /^[1-9]\d*$/.test(params.policyId ?? '')
    ? Number(params.policyId)
    : NaN
  const termsId = Number.isSafeInteger(id) ? id : null
  const query = useQuery({
    queryKey: termsQueryKeys.detail(termsId),
    queryFn: () => getTermsDetail(termsId as number),
    enabled: termsId !== null,
    throwOnError: false,
  })
  const policy = query.data

  if (termsId === null || checkIsNotFoundError(query.error)) {
    return <NotFoundPage />
  }

  return (
    <div className="app-mobile-bottom-nav-content bg-white pt-18.75">
      <Header
        className="app-mobile-fixed-top z-fixed fixed"
        contentClassName={
          policy?.type === 'SERVICE_TERMS' ? 'text-black' : undefined
        }
        leftAction={
          <IconButton
            aria-label="뒤로가기"
            onClick={() => navigate(ROUTES.terms, { replace: true })}
            size="xs"
          >
            <BackIcon className="size-6" />
          </IconButton>
        }
        subtitle={
          policy
            ? `최종 업데이트: ${formatLastUpdatedDate(policy.effectiveDate)}`
            : undefined
        }
        title={policy?.title ?? '이용약관'}
      />

      {query.isPending ? (
        <LoadingScreen />
      ) : query.isError ? (
        <div role="alert" className="px-5 py-7">
          <p>약관을 불러오지 못했어요.</p>
          <button type="button" onClick={() => void query.refetch()}>
            다시 시도
          </button>
        </div>
      ) : policy?.clauses.length === 0 ? (
        <p className="px-5 py-7">등록된 조항이 없어요.</p>
      ) : (
        <ul className="pt-6">
          {policy?.clauses.map((clause) => (
            <li key={clause.heading}>
              <Accordion
                className="pb-1.75"
                headingLevel={2}
                title={clause.heading}
              >
                <p className="whitespace-pre-wrap">{clause.content}</p>
              </Accordion>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
