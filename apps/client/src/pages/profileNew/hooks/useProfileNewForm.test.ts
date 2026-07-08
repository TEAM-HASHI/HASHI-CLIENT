import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useProfileNewForm } from '@/pages/profileNew/hooks/useProfileNewForm'

describe('useProfileNewForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const fillRequiredFields = (result: {
    current: ReturnType<typeof useProfileNewForm>
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
    const { result, unmount } = renderHook(() => useProfileNewForm())

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
    const { result } = renderHook(() => useProfileNewForm())
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

  it('resets selected profile image without marking server image deletion in create flow', () => {
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:profile-preview'),
      revokeObjectURL: vi.fn(),
    })
    const { result } = renderHook(() => useProfileNewForm())
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

    expect(profileDraft).toMatchObject({
      profileImageFile: undefined,
      isProfileImageDeleted: false,
    })
  })

  it('does not keep submitting state after creating a local profile draft', () => {
    const { result } = renderHook(() => useProfileNewForm())
    fillRequiredFields(result)

    act(() => {
      result.current.submit.createProfileDraft()
    })

    expect(result.current.submit.canSubmit).toBe(true)
    expect(result.current.submit.isSubmitting).toBe(false)
  })

  it('creates a normalized profile draft from valid form values', () => {
    const { result } = renderHook(() => useProfileNewForm())

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
})
