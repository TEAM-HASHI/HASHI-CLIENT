import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

export interface ReviewHeaderProps {
  title?: string
  onBackClick?: () => void
}

export const ReviewHeader = ({
  title = '리뷰 작성',
  onBackClick,
}: ReviewHeaderProps) => {
  return (
    <Header
      title={title}
      leftAction={
        <IconButton aria-label="뒤로가기" size="xs" onClick={onBackClick}>
          <BackIcon className="size-6" />
        </IconButton>
      }
    />
  )
}
