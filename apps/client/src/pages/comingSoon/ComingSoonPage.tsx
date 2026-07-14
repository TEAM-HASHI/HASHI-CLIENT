import { Button } from '@hashi/hds-ui'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/router/path'
import emptyImage from '@/shared/assets/images/empty.webp'

export const ComingSoonPage = () => {
  const navigate = useNavigate()

  return (
    <section className="app-mobile-bottom-nav-content flex flex-col items-center justify-center text-center">
      <div className="flex translate-y-[43px] flex-col items-center">
        <img
          alt=""
          aria-hidden="true"
          className="mb-[25px] h-19 w-[101px]"
          src={emptyImage}
        />
        <h1 className="typo-sub-header-1 text-cool-gray-900 mb-2">
          서비스를 준비하고 있어요.
        </h1>
        <p className="typo-body-8 text-cool-gray-500 mb-7 leading-[1.2]">
          더 편한 Hashi 이용을 위해
          <br />
          현재 기능을 준비하고 있어요.
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
