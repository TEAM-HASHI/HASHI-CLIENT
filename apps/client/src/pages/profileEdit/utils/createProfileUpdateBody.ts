import type { ProfileDraft } from '@/features/profile/hooks/useProfileForm'
import { normalizeDigits } from '@/features/profile/utils/profileForm'
import type { MyInfo } from '@/features/user/api/getMyInfo'
import type { UpdateProfileBody } from '@/pages/profileEdit/api/profileEditApi'

export const createProfileUpdateBody = (
  draft: ProfileDraft,
  saved: MyInfo,
): UpdateProfileBody => {
  const body: UpdateProfileBody = {}
  if (draft.nickname !== saved.nickname.trim()) body.nickname = draft.nickname
  const englishName = draft.englishName ?? ''
  if (englishName !== (saved.englishName ?? '').trim())
    body.nameEng = englishName
  if (draft.email !== saved.email.trim()) body.email = draft.email
  if (draft.phoneNumber !== normalizeDigits(saved.phoneNumber))
    body.phone = draft.phoneNumber
  if (draft.birthDate !== normalizeDigits(saved.birthDate))
    body.birthDate = `${draft.birthDate.slice(0, 4)}-${draft.birthDate.slice(4, 6)}-${draft.birthDate.slice(6)}`
  return body
}
