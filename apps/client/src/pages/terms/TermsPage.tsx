import { BackIcon, NextIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getTermsDetailPath } from '@/app/router/routePaths'
import { getTerms } from '@/features/terms/api/getTerms'
import { termsQueryKeys } from '@/features/terms/queries/termsQueryKeys'
import { LoadingScreen } from '@/shared/components/loadingScreen'

export const TermsPage = () => {
  const navigate = useNavigate()
  const query = useQuery({
    queryKey: termsQueryKeys.list(),
    queryFn: getTerms,
    throwOnError: false,
  })

  return (
    <div className="app-mobile-bottom-nav-content bg-white pt-18.75">
      <Header
        className="app-mobile-fixed-top z-fixed fixed"
        leftAction={
          <IconButton
            aria-label="뒤로가기"
            onClick={() => navigate(ROUTES.mypage, { replace: true })}
            size="xs"
          >
            <BackIcon className="size-6" />
          </IconButton>
        }
        title="이용약관"
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
      ) : query.data.length === 0 ? (
        <p className="px-5 py-7">등록된 약관이 없어요.</p>
      ) : (
        <ul>
          {query.data.map((policy) => (
            <li className="border-warm-gray-100 border-b" key={policy.termsId}>
              <button
                className="flex w-full items-start justify-between gap-3 px-5 py-7 text-left"
                onClick={() =>
                  navigate(getTermsDetailPath(String(policy.termsId)))
                }
                type="button"
              >
                <span className="flex min-w-0 flex-col gap-2">
                  <span className="typo-sub-header-2 break-keep text-[#101010]">
                    [{policy.title}]
                  </span>
                  <span className="typo-body-7 text-primary-200">
                    {policy.effectiveDate.replaceAll('-', '.')}
                  </span>
                </span>
                <NextIcon
                  aria-hidden="true"
                  className="text-cool-gray-900 size-6 shrink-0"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <address className="typo-caption-2 text-warm-gray-300 mb-4.5 flex flex-col p-5 leading-[1.5] not-italic">
        <p>이메일: hashiservice@gmail.com</p>
        <p>문의 채널: Hashi 카카오톡 채널</p>
      </address>
    </div>
  )
}
