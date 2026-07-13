import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

import { ProfileFields } from '@/pages/profileNew/components/ProfileFields'
import { ProfileImageSection } from '@/pages/profileNew/components/ProfileImageSection'
import { ProfileNewBottomBar } from '@/pages/profileNew/components/ProfileNewBottomBar'
import { useProfileNewPage } from '@/pages/profileNew/hooks/useProfileNewPage'

export const ProfileNewPage = () => {
  const { boundaryError, form, formId, handleBackClick, handleSubmit } =
    useProfileNewPage()

  if (boundaryError) {
    throw boundaryError
  }

  return (
    <div className="min-h-dvh bg-white pb-32">
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

      <form className="px-6 pt-[75px]" id={formId} onSubmit={handleSubmit}>
        <ProfileImageSection
          errorMessage={form.profileImage.errorMessage}
          onImageChange={form.profileImage.onChange}
          onImageDelete={form.profileImage.onDelete}
          previewUrl={form.profileImage.previewUrl}
        />

        <ProfileFields fields={form.fields} />

        {form.formError ? (
          <p className="typo-body-5 text-primary-500 mt-4" role="alert">
            {form.formError}
          </p>
        ) : null}
      </form>

      <ProfileNewBottomBar
        disabled={!form.submit.canSubmit}
        formId={formId}
        loading={form.submit.isSubmitting}
      />
    </div>
  )
}
