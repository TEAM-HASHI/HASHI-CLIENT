import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

import { ProfileFields } from '@/features/profile/components/ProfileFields'
import { ProfileFormBottomBar } from '@/features/profile/components/ProfileFormBottomBar'
import { ProfileImageSection } from '@/features/profile/components/ProfileImageSection'
import { useProfileNewPage } from '@/pages/profileNew/hooks/useProfileNewPage'

export const ProfileNewPage = () => {
  const { boundaryError, form, formId, handleBackClick, handleSubmit } =
    useProfileNewPage()

  if (boundaryError) {
    throw boundaryError
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <h1 className="sr-only">프로필 생성</h1>
      <div className="app-mobile-fixed-top z-fixed bg-white">
        <Header
          leftAction={
            <IconButton
              aria-label="뒤로가기"
              onClick={handleBackClick}
              size="xs"
            >
              <BackIcon className="size-6" />
            </IconButton>
          }
          title="프로필 생성"
        />
      </div>

      <form className="px-5 pt-[75px]" id={formId} onSubmit={handleSubmit}>
        <ProfileImageSection
          disabled={form.submit.isSubmitting}
          errorMessage={form.profileImage.errorMessage}
          onImageChange={form.profileImage.onChange}
          onImageDelete={form.profileImage.onDelete}
          previewUrl={form.profileImage.previewUrl}
        />

        <ProfileFields
          disabled={form.submit.isSubmitting}
          fields={form.fields}
        />

        {form.formError ? (
          <p className="typo-body-5 text-primary-500 mt-4" role="alert">
            {form.formError}
          </p>
        ) : null}
      </form>

      <ProfileFormBottomBar
        disabled={!form.submit.canSubmit}
        formId={formId}
        label="완료"
        loading={form.submit.isSubmitting}
      />
    </div>
  )
}
