import { Button } from '@hashi/hds-ui'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import notFoundImage from '@/shared/assets/images/not-found-redesign.svg'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <section className="app-mobile-bottom-nav-content flex flex-col items-center justify-center text-center">
      <div className="flex flex-col items-center">
        <h1 className="sr-only">404 페이지</h1>
        <img
          alt=""
          aria-hidden="true"
          width={200}
          height={150}
          src={notFoundImage}
        />
        <p className="typo-long-body-1 text-primary-200 mb-6.25">
          요청하신 페이지가 사라졌거나,
          <br />
          잘못된 경로로 이동했을 수 있어요.
        </p>
        <Button
          className="bg-cool-gray-900 w-46.25"
          onClick={() => navigate(ROUTES.home)}
          size="lg"
          type="button"
        >
          홈으로 돌아가기
        </Button>
      </div>
    </section>
  )
}
