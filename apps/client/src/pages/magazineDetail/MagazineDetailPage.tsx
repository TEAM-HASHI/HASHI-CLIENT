import { BackIcon } from '@hashi/hds-icons'
import { Button, Header, IconButton } from '@hashi/hds-ui'
import { useQuery } from '@tanstack/react-query'
import { useState, useSyncExternalStore } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet/AuthGateBottomSheet'
import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'
import { MagazineArticle } from '@/pages/magazineDetail/components/MagazineArticle'
import { MagazineRestaurantSection } from '@/pages/magazineDetail/components/MagazineRestaurantSection'
import { createMagazineDetailViewModel } from '@/pages/magazineDetail/utils/createMagazineDetailViewModel'
import { magazineDetailQueryOptions } from '@/pages/magazineDetail/queries/magazineDetailQueryOptions'
import { useMagazineLikeMutation } from '@/pages/magazineDetail/hooks/useMagazineLikeMutation'
import {
  getAuthSessionVersion,
  subscribeAuthSession,
} from '@/shared/auth/authSession'
import { checkHasHttpStatus } from '@/shared/api/apiError'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import { LoadingScreen } from '@/shared/components/loadingScreen'
import { useAuthStatus } from '@/shared/hooks/useAuthStatus'

export const MagazineDetailPage = () => {
  const { magazineId = '' } = useParams<{ magazineId: string }>()
  const viewer = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSessionVersion,
    getAuthSessionVersion,
  )
  return (
    <MagazineDetailContent
      key={`${magazineId}:${viewer}`}
      magazineId={magazineId}
      viewer={viewer}
    />
  )
}

const MagazineDetailContent = ({
  magazineId,
  viewer,
}: {
  magazineId: string
  viewer: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const id = Number(magazineId)
  const isValidId =
    /^\d+$/.test(magazineId) && Number.isSafeInteger(id) && id > 0
  const query = useQuery({
    ...magazineDetailQueryOptions(id, viewer),
    enabled: isValidId,
  })
  const like = useMagazineLikeMutation(id, viewer)
  const { isAuthenticated } = useAuthStatus()
  const { startKakaoOAuth } = useKakaoOAuthStart()
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false)

  const handleLikeToggle = () => {
    if (!isAuthenticated) {
      setIsAuthGateOpen(true)
      return
    }

    like.toggle()
  }

  const handleBackClick = () => {
    if (location.key !== 'default') {
      navigate(-1)
      return
    }

    navigate(ROUTES.magazines)
  }

  const notFound =
    !isValidId ||
    (checkHasHttpStatus(query.error) && query.error.status === 404)
  if (notFound || (!query.data && query.isError)) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5 text-center">
        <p role="alert">
          {notFound
            ? '매거진을 찾을 수 없습니다.'
            : getErrorPresentation(query.error).message}
        </p>
        {!notFound ? (
          <Button onClick={() => void query.refetch()}>다시 시도</Button>
        ) : null}
        <Button onClick={handleBackClick}>매거진 목록으로 돌아가기</Button>
      </div>
    )
  }
  if (!query.data) return <LoadingScreen />
  const magazine = createMagazineDetailViewModel(query.data)

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
          isLiked={query.data.liked}
          likeCount={magazine.likeCount}
          isLikePending={like.isPending}
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
