import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useProfileNewForm } from '@/pages/profileNew/hooks/useProfileNewForm'

describe('useProfileNewForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

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
})
