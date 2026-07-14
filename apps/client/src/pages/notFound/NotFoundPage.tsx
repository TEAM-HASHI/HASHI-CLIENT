import { Button } from '@hashi/hds-ui'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import notFoundImage from '@/shared/assets/images/not-found.webp'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <section className="app-mobile-bottom-nav-content flex flex-col items-center justify-center text-center">
      <div className="flex translate-y-7 flex-col items-center">
        <h1 className="sr-only">404 페이지</h1>
        <img
          alt=""
          aria-hidden="true"
          className="mb-[34px] h-[105px] w-[158px]"
          src={notFoundImage}
        />
        <p className="typo-long-body-1 text-primary-200 mb-[34px]">
          요청하신 페이지가 사라졌거나,
          <br />
          잘못된 경로로 이동했을 수 있어요.
        </p>
        <Button
          className="typo-sub-header-3 w-[185px]"
          onClick={() => navigate(ROUTES.home)}
          size="md"
          type="button"
        >
          홈으로 돌아가기
        </Button>
      </div>
    </section>
  )
}
