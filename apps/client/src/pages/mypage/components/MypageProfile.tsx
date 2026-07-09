import { Avatar, Button } from '@hashi/hds-ui'

type MypageProfileProps = {
  nickname: string
  profileImageUrl?: string | null
  onEditPress: () => void
}

export const MypageProfile = ({
  nickname,
  profileImageUrl,
  onEditPress,
}: MypageProfileProps) => {
  return (
    <section className="mb-8 flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <Avatar
          alt={`${nickname} 프로필 이미지`}
          className="size-10.5"
          src={profileImageUrl ?? undefined}
        />
        <h1 className="typo-header-1 text-cool-gray-900 truncate">
          {nickname}님
        </h1>
      </div>
      <Button
        className="h-7 px-3"
        onClick={onEditPress}
        size="sm"
        type="button"
      >
        수정
      </Button>
    </section>
  )
}
