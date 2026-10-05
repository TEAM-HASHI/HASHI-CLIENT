import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useProfileForm } from '@/features/profile/hooks/useProfileForm'

const initialValues = {
  nickname: '하시',
  birthDate: '19980512',
  phoneNumber: '01012345678',
  email: 'hashi@example.com',
}

describe('useProfileForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps the original comparison baseline and draft after a refetch', () => {
    const { result, rerender } = renderHook(
      ({ values }) =>
        useProfileForm({ initialValues: values, requireChanges: true }),
      { initialProps: { values: initialValues } },
    )
    rerender({ values: { ...initialValues, nickname: '서버 변경' } })
    expect(result.current.fields.nickname.value).toBe('하시')
    expect(result.current.submit.hasChanges).toBe(false)
    expect(result.current.submit.canSubmit).toBe(false)

    act(() => result.current.fields.nickname.onValueChange('작성 중'))
    rerender({ values: { ...initialValues, nickname: '작성 중' } })
    expect(result.current.fields.nickname.value).toBe('작성 중')
    expect(result.current.submit.hasChanges).toBe(true)
    act(() => result.current.fields.nickname.onValueChange('하시'))
    expect(result.current.submit.hasChanges).toBe(false)
  })

  it('distinguishes keeping, replacing, and deleting an existing photo in the draft', () => {
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:preview'),
      revokeObjectURL: vi.fn(),
    })
    const { result } = renderHook(() =>
      useProfileForm({
        initialValues: {
          ...initialValues,
          profileImageUrl: 'https://example.com/profile.png',
        },
        requireChanges: true,
      }),
    )
    act(() => result.current.fields.nickname.onValueChange('새로운 하시'))
    act(() => {
      expect(
        result.current.submit.createProfileDraft()?.profileImageChange,
      ).toEqual({ type: 'keep' })
    })
    const file = new File(['image'], 'profile.png', { type: 'image/png' })
    act(() => result.current.profileImage.onChange(file))
    act(() => {
      expect(
        result.current.submit.createProfileDraft()?.profileImageChange,
      ).toEqual({ type: 'replace', file })
    })
    act(() => result.current.profileImage.onDelete())
    act(() => {
      expect(
        result.current.submit.createProfileDraft()?.profileImageChange,
      ).toEqual({ type: 'delete' })
    })
  })

  it('returns to unchanged when a newly selected photo is removed without an original photo', () => {
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:preview'),
      revokeObjectURL: vi.fn(),
    })
    const { result } = renderHook(() =>
      useProfileForm({ initialValues, requireChanges: true }),
    )
    act(() =>
      result.current.profileImage.onChange(
        new File(['image'], 'profile.png', { type: 'image/png' }),
      ),
    )
    expect(result.current.submit.hasChanges).toBe(true)
    act(() => result.current.profileImage.onDelete())
    expect(result.current.submit.hasChanges).toBe(false)
    expect(result.current.submit.canSubmit).toBe(false)
  })

  it('revokes object URLs on replacement, deletion, and unmount', () => {
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi
        .fn()
        .mockReturnValueOnce('blob:first')
        .mockReturnValueOnce('blob:second')
        .mockReturnValueOnce('blob:third'),
      revokeObjectURL,
    })
    const file = new File(['image'], 'profile.png', { type: 'image/png' })
    const { result, unmount } = renderHook(() => useProfileForm())
    act(() => result.current.profileImage.onChange(file))
    act(() => result.current.profileImage.onChange(file))
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:first')
    act(() => result.current.profileImage.onDelete())
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:second')
    act(() => result.current.profileImage.onChange(file))
    unmount()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:third')
  })

  it('keeps the previous image and pending change when an invalid file is selected', () => {
    const createObjectURL = vi.fn(() => 'blob:valid')
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() })
    const { result } = renderHook(() => useProfileForm({ initialValues }))
    const validFile = new File(['image'], 'profile.png', { type: 'image/png' })
    act(() => result.current.profileImage.onChange(validFile))
    for (const file of [
      new File(['text'], 'profile.txt', { type: 'text/plain' }),
      new File(['gif'], 'profile.gif', { type: 'image/gif' }),
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', {
        type: 'image/png',
      }),
    ]) {
      act(() => result.current.profileImage.onChange(file))
      expect(result.current.profileImage.previewUrl).toBe('blob:valid')
      expect(result.current.profileImage.errorMessage).not.toBe('')
      act(() => {
        expect(
          result.current.submit.createProfileDraft()?.profileImageChange,
        ).toEqual({ type: 'replace', file: validFile })
      })
    }
    expect(createObjectURL).toHaveBeenCalledTimes(1)
  })

  it('keeps a server field error until that field changes', () => {
    const { result } = renderHook(() => useProfileForm({ initialValues }))
    act(() =>
      result.current.submit.setFieldError('nickname', '중복된 닉네임입니다.'),
    )
    expect(result.current.submit.canSubmit).toBe(false)
    act(() => result.current.fields.email.onValueChange('new@example.com'))
    expect(result.current.submit.canSubmit).toBe(false)
    act(() => result.current.fields.nickname.onValueChange('새로운 하시'))
    expect(result.current.fields.nickname.errorMessage).toBe('')
    expect(result.current.submit.canSubmit).toBe(true)
  })
})
