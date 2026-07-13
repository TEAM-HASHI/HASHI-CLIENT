import { InputField } from '@hashi/hds-ui'

import { FieldError } from '@/pages/profileNew/components/FieldError'

const PROFILE_ENGLISH_NAME_MAX_LENGTH = 20

interface ProfileFieldState {
  value: string
  onValueChange: (value: string) => void
  onBlur?: () => void
  errorMessage?: string
}

interface ProfileFieldsProps {
  disabled?: boolean
  fields: {
    nickname: ProfileFieldState
    birthDate: ProfileFieldState
    phoneNumber: ProfileFieldState
    englishName: Omit<ProfileFieldState, 'onBlur'>
    email: ProfileFieldState
  }
}

export const ProfileFields = ({
  disabled = false,
  fields,
}: ProfileFieldsProps) => {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <InputField
          aria-describedby={
            fields.nickname.errorMessage ? 'profile-nickname-error' : undefined
          }
          autoComplete="nickname"
          disabled={disabled}
          label="닉네임"
          onBlur={fields.nickname.onBlur}
          onChange={(event) => {
            fields.nickname.onValueChange(event.target.value)
          }}
          placeholder="이름을 입력해주세요."
          value={fields.nickname.value}
        />
        <FieldError
          id="profile-nickname-error"
          message={fields.nickname.errorMessage}
        />
      </div>

      <div>
        <InputField
          aria-describedby={
            fields.birthDate.errorMessage
              ? 'profile-birth-date-error'
              : undefined
          }
          inputMode="numeric"
          disabled={disabled}
          label="생년월일"
          maxLength={10}
          onBlur={fields.birthDate.onBlur}
          onChange={(event) => {
            fields.birthDate.onValueChange(event.target.value)
          }}
          placeholder="YYYYMMDD로 작성해주세요."
          value={fields.birthDate.value}
        />
        <FieldError
          id="profile-birth-date-error"
          message={fields.birthDate.errorMessage}
        />
      </div>

      <div>
        <InputField
          aria-describedby={
            fields.phoneNumber.errorMessage ? 'profile-phone-error' : undefined
          }
          autoComplete="tel"
          disabled={disabled}
          inputMode="tel"
          label="연락처"
          maxLength={13}
          onBlur={fields.phoneNumber.onBlur}
          onChange={(event) => {
            fields.phoneNumber.onValueChange(event.target.value)
          }}
          placeholder="숫자만 기입해주세요."
          value={fields.phoneNumber.value}
        />
        <FieldError
          id="profile-phone-error"
          message={fields.phoneNumber.errorMessage}
        />
      </div>

      <div>
        <InputField
          aria-describedby={
            fields.englishName.errorMessage
              ? 'profile-english-name-error'
              : undefined
          }
          autoComplete="name"
          disabled={disabled}
          label="영문 이름 (선택)"
          maxLength={PROFILE_ENGLISH_NAME_MAX_LENGTH}
          onChange={(event) => {
            fields.englishName.onValueChange(event.target.value)
          }}
          placeholder="영문 이름을 입력해주세요."
          value={fields.englishName.value}
        />
        <FieldError
          id="profile-english-name-error"
          message={fields.englishName.errorMessage}
        />
      </div>

      <div>
        <InputField
          aria-describedby={
            fields.email.errorMessage ? 'profile-email-error' : undefined
          }
          autoComplete="email"
          disabled={disabled}
          inputMode="email"
          label="이메일"
          onBlur={fields.email.onBlur}
          onChange={(event) => {
            fields.email.onValueChange(event.target.value)
          }}
          placeholder="메일을 입력해주세요."
          type="email"
          value={fields.email.value}
        />
        <FieldError
          id="profile-email-error"
          message={fields.email.errorMessage}
        />
      </div>
    </div>
  )
}
