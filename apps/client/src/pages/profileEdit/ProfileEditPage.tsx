import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'
import type { SyntheticEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ProfileFields } from '@/features/profile/components/ProfileFields'
import { ProfileFormBottomBar } from '@/features/profile/components/ProfileFormBottomBar'
import { ProfileImageSection } from '@/features/profile/components/ProfileImageSection'
import { useProfileForm } from '@/features/profile/hooks/useProfileForm'
import { useMyProfileSummaryQuery } from '@/features/user'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'
import { LoadingScreen } from '@/shared/components/loadingScreen'

const PROFILE_EDIT_FORM_ID = 'profile-edit-form'

interface ProfileEditFormProps {
  nickname: string
  profileImageUrl?: string | null
}

const ProfileEditForm = ({
  nickname,
  profileImageUrl,
}: ProfileEditFormProps) => {
  const navigate = useNavigate()
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)
  const form = useProfileForm({
    initialValues: {
      nickname,
      profileImageUrl: profileImageUrl ?? undefined,
    },
    requireChanges: true,
  })

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.submit.createProfileDraft()) return

    setIsComingSoonOpen(true)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <h1 className="sr-only">내 정보 수정</h1>
      <div className="app-mobile-fixed-top z-fixed bg-white">
        <Header
          leftAction={
            <IconButton
              aria-label="뒤로가기"
              onClick={() => navigate(-1)}
              size="xs"
            >
              <BackIcon className="size-6" />
            </IconButton>
          }
          title="내 정보 수정"
        />
      </div>

      <form
        className="px-5 pt-[75px]"
        id={PROFILE_EDIT_FORM_ID}
        onSubmit={handleSubmit}
      >
        <ProfileImageSection
          errorMessage={form.profileImage.errorMessage}
          onImageChange={form.profileImage.onChange}
          onImageDelete={form.profileImage.onDelete}
          previewUrl={form.profileImage.previewUrl}
        />
        <ProfileFields fields={form.fields} />
      </form>

      <ProfileFormBottomBar
        disabled={!form.submit.canSubmit}
        formId={PROFILE_EDIT_FORM_ID}
        label="저장하기"
      />

      <ComingSoonDialog
        onOpenChange={setIsComingSoonOpen}
        open={isComingSoonOpen}
      />
    </div>
  )
}

export const ProfileEditPage = () => {
  const profileSummaryQuery = useMyProfileSummaryQuery()

  if (profileSummaryQuery.error) throw profileSummaryQuery.error
  if (profileSummaryQuery.isPending) return <LoadingScreen />

  return (
    <ProfileEditForm
      nickname={profileSummaryQuery.data.nickname}
      profileImageUrl={profileSummaryQuery.data.profileImageUrl}
    />
  )
}
