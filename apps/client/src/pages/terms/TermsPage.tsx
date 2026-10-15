import { BackIcon, NextIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getTermsDetailPath } from '@/app/router/routePaths'
import { TERMS_POLICIES } from '@/features/terms/constants/termsPolicies'

export const TermsPage = () => {
  const navigate = useNavigate()

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

      <ul>
        {TERMS_POLICIES.map((policy) => (
          <li className="border-warm-gray-100 border-b" key={policy.id}>
            <button
              className="flex w-full justify-between gap-3 px-5 py-7 text-left"
              onClick={() => navigate(getTermsDetailPath(policy.id))}
              type="button"
            >
              <span className="flex min-w-0 flex-col gap-2">
                <span className="typo-sub-header-2 break-keep text-black">
                  [{policy.title}]
                </span>
                <span className="typo-body-7 text-primary-200">
                  {policy.effectiveDate}
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

      <address className="typo-caption-2 text-warm-gray-300 mb-4.5 flex flex-col p-5 leading-[1.5] not-italic">
        <p>이메일: hashiservice@gmail.com</p>
        <p>문의 채널: Hashi 카카오톡 채널</p>
      </address>
    </div>
  )
}
