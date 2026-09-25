import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { MagazineArticle } from '@/pages/magazineDetail/components/MagazineArticle'
import { MagazineRestaurantSection } from '@/pages/magazineDetail/components/MagazineRestaurantSection'
import { createMagazineDetailPreview } from '@/pages/magazineDetail/data/magazineDetailPreview'

export const MagazineDetailPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { magazineId = '' } = useParams<{ magazineId: string }>()
  const magazine = createMagazineDetailPreview(location.state)
  const [likeState, setLikeState] = useState({
    isLiked: false,
    magazineId,
  })
  const isLiked =
    likeState.magazineId === magazineId ? likeState.isLiked : false
  const likeCount = magazine.likeCount + (isLiked ? 1 : 0)

  const handleLikeToggle = () => {
    setLikeState((currentState) => ({
      isLiked:
        currentState.magazineId === magazineId ? !currentState.isLiked : true,
      magazineId,
    }))
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

      <main className="pt-18.75">
        <MagazineArticle
          isLiked={isLiked}
          likeCount={likeCount}
          magazine={magazine}
          magazineId={magazineId}
          onLikeToggle={handleLikeToggle}
        />

        <MagazineRestaurantSection restaurants={magazine.restaurants} />
      </main>
    </div>
  )
}
