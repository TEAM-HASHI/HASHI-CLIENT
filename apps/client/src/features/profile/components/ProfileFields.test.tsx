import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ProfileFields } from '@/features/profile/components/ProfileFields'

const field = { value: '', onValueChange: vi.fn() }
const baseFields = {
  nickname: field,
  birthDate: field,
  phoneNumber: field,
  englishName: field,
  email: field,
}

afterEach(cleanup)

describe('ProfileFields 초대자 코드', () => {
  it('inviteCode를 전달하지 않으면 초대자 코드 필드를 보여주지 않는다', () => {
    render(<ProfileFields fields={baseFields} />)

    expect(screen.queryByLabelText('초대자 코드 (선택)')).toBeNull()
  })

  it('유효한 코드면 확인 문구를 보여준다', () => {
    render(
      <ProfileFields
        fields={{
          ...baseFields,
          inviteCode: {
            ...field,
            value: 'X78Yu9221',
            successMessage: '확인되었습니다.',
          },
        }}
      />,
    )

    expect(screen.getByLabelText('초대자 코드 (선택)')).toHaveValue('X78Yu9221')
    expect(screen.getByRole('status')).toHaveTextContent('확인되었습니다.')
  })

  it('오류가 있으면 확인 문구 대신 오류 문구를 보여준다', () => {
    render(
      <ProfileFields
        fields={{
          ...baseFields,
          inviteCode: {
            ...field,
            errorMessage: '존재하지 않는 코드 입니다.',
            successMessage: '확인되었습니다.',
          },
        }}
      />,
    )

    expect(screen.getByLabelText('초대자 코드 (선택)')).toBeInvalid()
    expect(screen.getByRole('alert')).toHaveTextContent(
      '존재하지 않는 코드 입니다.',
    )
    expect(screen.queryByRole('status')).toBeNull()
  })
})
