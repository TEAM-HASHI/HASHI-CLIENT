import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { KakaoStartButton } from '@/shared/components/kakaoStartButton/KakaoStartButton'

describe('KakaoStartButton', () => {
  it('renders the QA dimensions and calls the press handler', () => {
    const onPress = vi.fn()

    render(
      <KakaoStartButton onPress={onPress}>
        카카오로 로그인하기
      </KakaoStartButton>,
    )

    const button = screen.getByRole('button', {
      name: '카카오로 로그인하기',
    })

    expect(button).toHaveClass(
      'h-12',
      'w-[268px]',
      'gap-3',
      'typo-sub-header-3',
    )
    expect(button.querySelector('svg')).toHaveClass('h-5', 'w-[21px]')
    expect(button.querySelector('svg')).not.toHaveClass(
      'absolute',
      'left-[57px]',
    )

    fireEvent.click(button)

    expect(onPress).toHaveBeenCalledOnce()
  })
})
