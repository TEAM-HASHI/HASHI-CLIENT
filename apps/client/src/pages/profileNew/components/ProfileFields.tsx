import { InputField } from '@hashi/hds-ui'

import { FieldError } from '@/pages/profileNew/components/FieldError'

interface ProfileFieldState {
  value: string
  onValueChange: (value: string) => void
  onBlur?: () => void
  errorMessage?: string
}

interface ProfileFieldsProps {
  fields: {
    nickname: ProfileFieldState
    birthDate: ProfileFieldState
    phoneNumber: ProfileFieldState
    englishName: Omit<ProfileFieldState, 'errorMessage' | 'onBlur'>
    email: ProfileFieldState
  }
}

export const ProfileFields = ({ fields }: ProfileFieldsProps) => {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <InputField
          aria-describedby={
            fields.nickname.errorMessage ? 'profile-nickname-error' : undefined
          }
          autoComplete="nickname"
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

      <InputField
        autoComplete="name"
        label="영문 이름 (선택)"
        onChange={(event) => {
          fields.englishName.onValueChange(event.target.value)
        }}
        placeholder="영문 이름을 입력해주세요."
        value={fields.englishName.value}
      />

      <div>
        <InputField
          aria-describedby={
            fields.email.errorMessage ? 'profile-email-error' : undefined
          }
          autoComplete="email"
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
