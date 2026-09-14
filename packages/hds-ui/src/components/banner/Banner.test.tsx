import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Banner } from './Banner'
import { Carousel } from '../carousel'

describe('Banner', () => {
  it('updates image and text when switching variants without retaining old copy', () => {
    const { rerender } = render(
      <Banner
        imageSrc="/first.png"
        imageAlt="첫 배너"
        variant="withText"
        title="제목"
        subtitle="설명"
      />,
    )
    expect(screen.getByRole('img', { name: '첫 배너' })).toHaveAttribute(
      'src',
      '/first.png',
    )
    expect(screen.getByText('제목')).toBeInTheDocument()
    expect(screen.getByText('설명')).toBeInTheDocument()
    rerender(<Banner imageSrc="/second.png" imageAlt="다음 배너" />)
    expect(screen.getByRole('img', { name: '다음 배너' })).toHaveAttribute(
      'src',
      '/second.png',
    )
    expect(screen.queryByText('제목')).not.toBeInTheDocument()
    expect(screen.queryByText('설명')).not.toBeInTheDocument()
  })

  it('synchronizes a fixed indicator with controlled selection and hides it for one item', () => {
    const renderBanners = (count: number, index: number) => (
      <Carousel.Root aria-label="배너 목록" index={index}>
        <Carousel.Viewport>
          <Carousel.Track>
            {Array.from({ length: count }, (_, itemIndex) => (
              <Carousel.Item key={itemIndex}>
                <Banner imageSrc="/banner.png" imageAlt="배너" />
              </Carousel.Item>
            ))}
          </Carousel.Track>
        </Carousel.Viewport>
        <Carousel.Indicator align="end" className="right-5 bottom-5.75" />
      </Carousel.Root>
    )
    const { container, rerender } = render(renderBanners(3, 0))
    const indicators = () =>
      Array.from(container.querySelectorAll('[data-hds-carousel-indicator]'))
    expect(indicators()).toHaveLength(1)
    indicators().forEach((indicator) => {
      expect(indicator).toHaveAttribute('aria-hidden', 'true')
      expect(indicator.closest('[data-hds-carousel-track]')).toBeNull()
      expect(indicator.children[0]).toHaveAttribute('data-current', 'true')
    })
    rerender(renderBanners(3, 2))
    indicators().forEach((indicator) => {
      expect(indicator.children[0]).not.toHaveAttribute('data-current')
      expect(indicator.children[2]).toHaveAttribute('data-current', 'true')
    })
    rerender(renderBanners(1, 0))
    expect(indicators()).toHaveLength(0)
  })
})
