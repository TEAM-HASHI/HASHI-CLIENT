import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

import { ProfileFields } from '@/features/profile/components/ProfileFields'
import { ProfileFormBottomBar } from '@/features/profile/components/ProfileFormBottomBar'
import { ProfileImageSection } from '@/features/profile/components/ProfileImageSection'
import { useMyInfoQuery } from '@/features/user'
import type { MyInfo } from '@/features/user/api/getMyInfo'
import { useProfileEditPage } from '@/pages/profileEdit/hooks/useProfileEditPage'
import { LoadingScreen } from '@/shared/components/loadingScreen'

const PROFILE_EDIT_FORM_ID = 'profile-edit-form'

const ProfileEditForm = (profile: MyInfo) => {
  const { form, fields, canSubmit, isSubmitting, handleBack, handleSubmit } =
    useProfileEditPage(profile)

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <h1 className="sr-only">내 정보 수정</h1>
      <div className="app-mobile-fixed-top z-fixed bg-white">
        <Header
          leftAction={
            <IconButton
              aria-label="뒤로가기"
              disabled={isSubmitting}
              onClick={handleBack}
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
          disabled={isSubmitting}
          errorMessage={form.profileImage.errorMessage}
          onImageChange={form.profileImage.onChange}
          onImageDelete={form.profileImage.onDelete}
          previewUrl={form.profileImage.previewUrl}
        />
        <ProfileFields disabled={isSubmitting} fields={fields} />
        {form.formError ? (
          <p className="typo-body-7 text-error mt-4" role="alert">
            {form.formError}
          </p>
        ) : null}
      </form>

      <ProfileFormBottomBar
        disabled={!canSubmit}
        formId={PROFILE_EDIT_FORM_ID}
        label="저장"
        loading={isSubmitting}
      />
    </div>
  )
}

export const ProfileEditPage = () => {
  const myInfoQuery = useMyInfoQuery()

  if (!myInfoQuery.data) {
    if (myInfoQuery.error) throw myInfoQuery.error
    return <LoadingScreen />
  }

  return (
    <ProfileEditForm
      nickname={myInfoQuery.data.nickname}
      englishName={myInfoQuery.data.englishName}
      birthDate={myInfoQuery.data.birthDate}
      phoneNumber={myInfoQuery.data.phoneNumber}
      email={myInfoQuery.data.email}
      profileImageUrl={myInfoQuery.data.profileImageUrl}
    />
  )
}
