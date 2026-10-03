import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet/AuthGateBottomSheet'
import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'
import { ComingSoonPage } from '@/pages/comingSoon/ComingSoonPage'
import { MagazineArticle } from '@/pages/magazineDetail/components/MagazineArticle'
import { MagazineRestaurantSection } from '@/pages/magazineDetail/components/MagazineRestaurantSection'
import { createMagazineDetailPreview } from '@/pages/magazineDetail/data/magazineDetailPreview'
import { useAuthStatus } from '@/shared/hooks/useAuthStatus'

export const MagazineDetailPage = () => {
  const { magazineId = '' } = useParams<{ magazineId: string }>()

  // 상세 API 연동 전에는 운영 환경에 퍼블리싱용 데이터를 노출하지 않습니다.
  return import.meta.env.DEV ? (
    <MagazineDetailPreview key={magazineId} />
  ) : (
    <ComingSoonPage />
  )
}

const MagazineDetailPreview = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const magazine = createMagazineDetailPreview(location.state)
  const { isAuthenticated } = useAuthStatus()
  const { startKakaoOAuth } = useKakaoOAuthStart()
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const likeCount = magazine.likeCount + (isLiked ? 1 : 0)

  const handleLikeToggle = () => {
    if (!isAuthenticated) {
      setIsAuthGateOpen(true)
      return
    }

    setIsLiked((current) => !current)
  }

  const handleBackClick = () => {
    if (location.key !== 'default') {
      navigate(-1)
      return
    }

    navigate(ROUTES.magazines)
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="app-mobile-fixed-top z-fixed bg-white">
        <Header
          leftAction={
            <IconButton
              aria-label="매거진 목록으로 돌아가기"
              onClick={handleBackClick}
              size="xs"
            >
              <BackIcon className="size-6" />
            </IconButton>
          }
          title={magazine.title}
        />
      </div>

      <div className="pt-18.75">
        <MagazineArticle
          isLiked={isLiked}
          likeCount={likeCount}
          magazine={magazine}
          onLikeToggle={handleLikeToggle}
        />

        <MagazineRestaurantSection restaurants={magazine.restaurants} />
      </div>
      <AuthGateBottomSheet
        open={isAuthGateOpen}
        onOpenChange={setIsAuthGateOpen}
        onKakaoPress={() => startKakaoOAuth(location.pathname)}
      />
    </div>
  )
}
