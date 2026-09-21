import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useProfileForm } from '@/features/profile/hooks/useProfileForm'

describe('useProfileForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const fillRequiredFields = (result: {
    current: ReturnType<typeof useProfileForm>
  }) => {
    act(() => {
      result.current.fields.nickname.onValueChange('하시')
      result.current.fields.birthDate.onValueChange('20260708')
      result.current.fields.phoneNumber.onValueChange('01012345678')
      result.current.fields.email.onValueChange('hashi@example.com')
    })
  }

  it('revokes profile image preview URLs when replacing, deleting, and unmounting', () => {
    const createObjectUrl = vi
      .fn()
      .mockReturnValueOnce('blob:first-preview')
      .mockReturnValueOnce('blob:second-preview')
      .mockReturnValueOnce('blob:third-preview')
    const revokeObjectUrl = vi.fn()
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    })
    const firstFile = new File(['first'], 'first.png', { type: 'image/png' })
    const secondFile = new File(['second'], 'second.png', {
      type: 'image/png',
    })
    const thirdFile = new File(['third'], 'third.png', { type: 'image/png' })
    const { result, unmount } = renderHook(() => useProfileForm())

    act(() => {
      result.current.profileImage.onChange(firstFile)
    })

    expect(result.current.profileImage.previewUrl).toBe('blob:first-preview')

    act(() => {
      result.current.profileImage.onChange(secondFile)
    })

    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:first-preview')
    expect(result.current.profileImage.previewUrl).toBe('blob:second-preview')

    act(() => {
      result.current.profileImage.onDelete()
    })

    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:second-preview')
    expect(result.current.profileImage.previewUrl).toBeUndefined()

    act(() => {
      result.current.profileImage.onChange(thirdFile)
    })

    unmount()

    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:third-preview')
  })

  it('rejects non-image files without creating a preview URL', () => {
    const createObjectUrl = vi.fn(() => 'blob:text-preview')
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
    })
    const { result } = renderHook(() => useProfileForm())
    const textFile = new File(['profile'], 'profile.txt', {
      type: 'text/plain',
    })

    act(() => {
      result.current.profileImage.onChange(textFile)
    })

    expect(createObjectUrl).not.toHaveBeenCalled()
    expect(result.current.profileImage.previewUrl).toBeUndefined()
    expect(result.current.profileImage.errorMessage).toBe(
      '이미지 파일만 등록해주세요.',
    )
  })

  it('rejects unsupported image MIME types without creating a preview URL', () => {
    const createObjectUrl = vi.fn(() => 'blob:gif-preview')
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
    })
    const { result } = renderHook(() => useProfileForm())
    const gifFile = new File(['profile'], 'profile.gif', {
      type: 'image/gif',
    })

    act(() => {
      result.current.profileImage.onChange(gifFile)
    })

    expect(createObjectUrl).not.toHaveBeenCalled()
    expect(result.current.profileImage.previewUrl).toBeUndefined()
    expect(result.current.profileImage.errorMessage).toBe(
      '이미지 파일만 등록해주세요.',
    )
  })

  it('resets selected profile image without adding a deletion flag to the create draft', () => {
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:profile-preview'),
      revokeObjectURL: vi.fn(),
    })
    const { result } = renderHook(() => useProfileForm())
    const imageFile = new File(['profile'], 'profile.png', {
      type: 'image/png',
    })

    act(() => {
      result.current.profileImage.onChange(imageFile)
    })
    act(() => {
      result.current.profileImage.onDelete()
    })
    fillRequiredFields(result)

    let profileDraft: ReturnType<
      typeof result.current.submit.createProfileDraft
    >

    act(() => {
      profileDraft = result.current.submit.createProfileDraft()
    })

    expect(profileDraft).toMatchObject({ profileImageFile: undefined })
    expect(profileDraft).not.toHaveProperty('isProfileImageDeleted')
  })

  it('initializes fields and profile image from existing profile values', () => {
    const { result } = renderHook(() =>
      useProfileForm({
        initialValues: {
          profileImageUrl: 'https://example.com/profile.png',
          nickname: '하시',
          birthDate: '20260708',
          phoneNumber: '01012345678',
          englishName: 'Hashi',
          email: 'hashi@example.com',
        },
      }),
    )

    expect(result.current.profileImage.previewUrl).toBe(
      'https://example.com/profile.png',
    )
    expect(result.current.fields.nickname.value).toBe('하시')
    expect(result.current.fields.birthDate.value).toBe('2026/07/08')
    expect(result.current.fields.phoneNumber.value).toBe('010-1234-5678')
    expect(result.current.fields.englishName.value).toBe('Hashi')
    expect(result.current.fields.email.value).toBe('hashi@example.com')
  })

  it('requires a valid change when requireChanges is enabled', () => {
    const { result } = renderHook(() =>
      useProfileForm({
        initialValues: {
          nickname: '하시',
          birthDate: '20260708',
          phoneNumber: '01012345678',
          email: 'hashi@example.com',
        },
        requireChanges: true,
      }),
    )

    expect(result.current.submit.hasChanges).toBe(false)
    expect(result.current.submit.canSubmit).toBe(false)

    act(() => {
      result.current.fields.nickname.onValueChange('하시 수정')
    })

    expect(result.current.submit.hasChanges).toBe(true)
    expect(result.current.submit.canSubmit).toBe(true)
  })

  it('restores the unchanged state after removing a newly selected image', () => {
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:profile-preview'),
      revokeObjectURL: vi.fn(),
    })
    const { result } = renderHook(() =>
      useProfileForm({
        initialValues: {
          nickname: '하시',
          birthDate: '20260708',
          phoneNumber: '01012345678',
          email: 'hashi@example.com',
        },
        requireChanges: true,
      }),
    )
    const imageFile = new File(['profile'], 'profile.png', {
      type: 'image/png',
    })

    act(() => {
      result.current.profileImage.onChange(imageFile)
    })

    expect(result.current.submit.hasChanges).toBe(true)

    act(() => {
      result.current.profileImage.onDelete()
    })

    expect(result.current.submit.hasChanges).toBe(false)
    expect(result.current.submit.canSubmit).toBe(false)
  })

  it('shows required field errors after submit is attempted', () => {
    const { result } = renderHook(() => useProfileForm())

    act(() => {
      result.current.submit.createProfileDraft()
    })

    expect(result.current.fields.nickname.errorMessage).toBe(
      '닉네임을 입력해주세요.',
    )
    expect(result.current.fields.birthDate.errorMessage).toBe(
      '생년월일을 정확히 입력해주세요.',
    )
    expect(result.current.fields.phoneNumber.errorMessage).toBe(
      '연락처를 정확히 입력해주세요.',
    )
    expect(result.current.fields.email.errorMessage).toBe(
      '이메일을 정확히 입력해주세요.',
    )
  })

  it('blocks submit after a server field error until that field changes', () => {
    const { result } = renderHook(() => useProfileForm())
    fillRequiredFields(result)

    act(() => {
      result.current.submit.setFieldError('nickname', '중복된 닉네임입니다.')
    })

    expect(result.current.fields.nickname.errorMessage).toBe(
      '중복된 닉네임입니다.',
    )
    expect(result.current.submit.canSubmit).toBe(false)

    act(() => {
      result.current.fields.nickname.onValueChange('새로운 닉네임')
    })

    expect(result.current.fields.nickname.errorMessage).toBe('')
    expect(result.current.submit.canSubmit).toBe(true)
  })

  it('clears a form error after a field changes', () => {
    const { result } = renderHook(() => useProfileForm())

    act(() => {
      result.current.submit.setFormError('이미 사용 중인 가입 정보입니다')
    })

    expect(result.current.formError).toBe('이미 사용 중인 가입 정보입니다')

    act(() => {
      result.current.fields.nickname.onValueChange('새로운 닉네임')
    })

    expect(result.current.formError).toBe('')
  })

  it('creates a normalized profile draft from valid form values', () => {
    const { result } = renderHook(() => useProfileForm())

    act(() => {
      result.current.fields.nickname.onValueChange('  하시  ')
      result.current.fields.birthDate.onValueChange('2026/07/08')
      result.current.fields.phoneNumber.onValueChange('010-1234-5678')
      result.current.fields.englishName.onValueChange('  Hashi  ')
      result.current.fields.email.onValueChange('  hashi@example.com  ')
    })

    let profileDraft: ReturnType<
      typeof result.current.submit.createProfileDraft
    >

    act(() => {
      profileDraft = result.current.submit.createProfileDraft()
    })

    expect(profileDraft).toMatchObject({
      nickname: '하시',
      birthDate: '20260708',
      phoneNumber: '01012345678',
      englishName: 'Hashi',
      email: 'hashi@example.com',
    })
  })

  it('does not block submit with the old duplicated nickname mock list', () => {
    const { result } = renderHook(() => useProfileForm())

    act(() => {
      result.current.fields.nickname.onValueChange('중복')
      result.current.fields.birthDate.onValueChange('2026/07/08')
      result.current.fields.phoneNumber.onValueChange('010-1234-5678')
      result.current.fields.email.onValueChange('hashi@example.com')
    })

    expect(result.current.fields.nickname.errorMessage).toBe('')
    expect(result.current.submit.canSubmit).toBe(true)

    let profileDraft: ReturnType<
      typeof result.current.submit.createProfileDraft
    >

    act(() => {
      profileDraft = result.current.submit.createProfileDraft()
    })

    expect(profileDraft).toMatchObject({ nickname: '중복' })
  })
})
