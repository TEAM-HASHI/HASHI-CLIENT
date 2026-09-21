import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { KakaoStartButton } from '@/shared/components/kakaoStartButton/KakaoStartButton'

describe('KakaoStartButton', () => {
  it('renders its label and calls the press handler', () => {
    const onPress = vi.fn()

    render(
      <KakaoStartButton onPress={onPress}>
        카카오로 로그인하기
      </KakaoStartButton>,
    )

    const button = screen.getByRole('button', {
      name: '카카오로 로그인하기',
    })

    fireEvent.click(button)

    expect(onPress).toHaveBeenCalledOnce()
  })
})
