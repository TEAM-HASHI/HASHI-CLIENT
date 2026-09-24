import { BackIcon, NextIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'
import { useNavigate } from 'react-router-dom'

import { getTermsDetailPath } from '@/app/router/routePaths'
import { TERMS_POLICIES } from '@/features/terms/constants/termsPolicies'

export const TermsPage = () => {
  const navigate = useNavigate()

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
        title="이용약관"
      />

      <ul>
        {TERMS_POLICIES.map((policy) => (
          <li className="border-secondary-200 border-b" key={policy.id}>
            <button
              className="flex w-full items-center justify-between gap-3 px-5 py-7 text-left"
              onClick={() => navigate(getTermsDetailPath(policy.id))}
              type="button"
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="typo-sub-header-3 text-cool-gray-900 break-keep">
                  [{policy.title}]
                </span>
                <span className="typo-body-8 text-cool-gray-500">
                  {policy.effectiveDate}
                </span>
              </span>
              <NextIcon aria-hidden="true" className="size-4 shrink-0" />
            </button>
          </li>
        ))}
      </ul>

      <address className="typo-caption-3 text-warm-gray-300 flex flex-col gap-1 px-5 pt-6 not-italic">
        <p>이메일: hashiservice@gmail.com</p>
        <p>문의 채널: Hashi 카카오톡 채널</p>
      </address>
    </div>
  )
}
