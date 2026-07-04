import { Button } from '@hashi/hds-ui'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/router/path'
import emptyImage from '@/shared/assets/images/empty.webp'

export const ComingSoonPage = () => {
  const navigate = useNavigate()

  return (
    <main className="app-mobile-bottom-nav-content flex flex-col items-center justify-center text-center">
      <img
        alt=""
        aria-hidden="true"
        className="mb-[22.5px] h-auto w-33.75"
        src={emptyImage}
      />
      <div>
        <h1 className="typo-header-3 text-cool-gray-900 mb-2">
          서비스를 준비하고 있어요.
        </h1>
        <p className="typo-body-5 text-cool-gray-500 mb-5 leading-[1.4]">
          더 편한 Hashi 이용을 위해
          <br />
          현재 기능을 준비하고 있어요.
        </p>
        <Button
          className="typo-sub-header-2 w-59.25"
          onClick={() => navigate(ROUTES.home)}
          size="md"
          type="button"
        >
          홈으로 돌아가기
        </Button>
      </div>
    </main>
  )
}
