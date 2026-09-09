import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'

import { Banner } from '../banner'
import { Carousel } from './Carousel'

const bannerMagazineImageSrc = new URL(
  './assets/banner_magazine.png',
  import.meta.url,
).href

const mobileFrameDecorator = (Story: () => ReactNode) => (
  <div className="w-full max-w-[393px] bg-white">
    <Story />
  </div>
)

const slideClassNames = [
  'from-cool-gray-50 via-warm-gray-50 to-cool-gray-100',
  'from-secondary-200 via-cool-gray-50 to-cool-gray-100',
  'from-warm-gray-50 via-secondary-200 to-cool-gray-50',
  'from-cool-gray-100 via-warm-gray-50 to-secondary-200',
]

const meta = {
  title: 'Components/Carousel',
  component: Carousel.Root,
  tags: ['autodocs'],
  decorators: [mobileFrameDecorator],
  parameters: {
    docs: {
      story: {
        iframeHeight: 280,
        inline: false,
      },
    },
  },
  args: {
    'aria-label': '콘텐츠 배너',
    children: null,
    defaultIndex: 0,
  },
  argTypes: {
    children: {
      control: false,
    },
    defaultIndex: {
      control: 'number',
    },
    index: {
      control: false,
    },
    onIndexChange: {
      control: false,
    },
  },
} satisfies Meta<typeof Carousel.Root>

export default meta

type Story = StoryObj<typeof meta>

const PlaceholderSlide = ({
  children,
  toneIndex = 0,
}: {
  children?: ReactNode
  toneIndex?: number
}) => (
  <div
    className={`relative flex size-full items-center justify-center bg-gradient-to-br ${slideClassNames[toneIndex % slideClassNames.length]}`}
  >
    <div className="text-cool-gray-900 rounded-[8px] bg-white/70 px-4 py-2 text-[14px] font-semibold">
      {children}
    </div>
  </div>
)

const BasicSlides = ({ count = 4 }: { count?: number }) => (
  <Carousel.Track>
    {Array.from({ length: count }, (_, index) => (
      <Carousel.Item key={index}>
        <PlaceholderSlide toneIndex={index}>Slide {index + 1}</PlaceholderSlide>
      </Carousel.Item>
    ))}
  </Carousel.Track>
)

const BannerSlides = ({
  withText = false,
  count = 4,
  longText = false,
}: {
  withText?: boolean
  count?: number
  longText?: boolean
}) => (
  <Carousel.Track>
    {Array.from({ length: count }, (_, index) => (
      <Carousel.Item key={index}>
        <Banner
          imageSrc={bannerMagazineImageSrc}
          imageAlt={withText ? '' : `배너 이미지 ${index + 1}`}
          indicator={<Carousel.Indicator placement="inline" />}
          {...(withText
            ? {
                variant: 'withText' as const,
                title: longText
                  ? '아주 긴 제목이 들어와도 배너 너비를 넘지 않도록 확인합니다'
                  : `제목제목제목제목제목 ${index + 1}`,
                subtitle: longText
                  ? '긴 설명과 인디케이터가 겹치지 않고 남은 공간에서 말줄임됩니다'
                  : '소제목소제목소제목소제목소제목',
              }
            : { variant: 'withoutText' as const })}
        />
      </Carousel.Item>
    ))}
  </Carousel.Track>
)

export const Default: Story = {
  render: (args) => (
    <div className="mx-auto w-full max-w-[353px]">
      <Carousel.Root {...args}>
        <Carousel.Viewport>
          <BannerSlides withText />
        </Carousel.Viewport>
      </Carousel.Root>
    </div>
  ),
}

export const WithoutText: Story = {
  render: (args) => (
    <div className="mx-auto w-full max-w-[353px]">
      <Carousel.Root {...args}>
        <Carousel.Viewport>
          <BannerSlides />
        </Carousel.Viewport>
      </Carousel.Root>
    </div>
  ),
}

export const NarrowBanner: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-[280px]">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Carousel.Root {...args}>
      <Carousel.Viewport>
        <BannerSlides withText longText count={6} />
      </Carousel.Viewport>
    </Carousel.Root>
  ),
}

export const PaddedMagazineBanner: Story = {
  render: (args) => (
    <div className="mx-auto w-full max-w-[353px]">
      <Carousel.Root {...args}>
        <Carousel.Viewport className="aspect-[353/160] overflow-y-hidden rounded-[8px]">
          <BasicSlides />
        </Carousel.Viewport>
        <Carousel.Indicator />
      </Carousel.Root>
    </div>
  ),
}

export const FullWidthImageArea: Story = {
  render: (args) => (
    <Carousel.Root {...args} aria-label="풀폭 이미지 영역 배너">
      <Carousel.Viewport className="aspect-[393/234] overflow-y-hidden">
        <BasicSlides />
      </Carousel.Viewport>
      <Carousel.Indicator />
    </Carousel.Root>
  ),
}

export const TextOverlayEndIndicator: Story = {
  render: (args) => (
    <Carousel.Root {...args} aria-label="텍스트 오버레이 배너">
      <Carousel.Viewport className="aspect-[393/234] overflow-y-hidden">
        <Carousel.Track>
          {[0, 1, 2, 3].map((index) => (
            <Carousel.Item key={index}>
              <a
                className="from-cool-gray-800 via-cool-gray-600 to-warm-gray-300 relative block size-full bg-gradient-to-br"
                href={`#carousel-text-overlay-${index + 1}`}
              >
                <div className="from-cool-gray-900/80 absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent" />
                <div className="absolute bottom-9 left-6 flex flex-col gap-2">
                  <p className="m-0 text-[30px] leading-none font-bold text-white">
                    오늘의 Pick
                  </p>
                  <p className="m-0 text-[16px] leading-[1.35] font-semibold text-white">
                    한 장의 배너에 소개 문구를 올려보기
                  </p>
                </div>
              </a>
            </Carousel.Item>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.Indicator align="end" />
    </Carousel.Root>
  ),
}

export const SwipeInteraction: Story = {
  render: (args) => (
    <Carousel.Root {...args} aria-label="스와이프 확인 배너">
      <Carousel.Viewport className="aspect-[393/234] overflow-y-hidden">
        <Carousel.Track>
          {[0, 1, 2, 3].map((index) => (
            <Carousel.Item key={index}>
              <PlaceholderSlide toneIndex={index}>
                Swipe {index + 1}
              </PlaceholderSlide>
            </Carousel.Item>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.Indicator />
    </Carousel.Root>
  ),
}

export const SingleItemWithoutIndicator: Story = {
  render: (args) => (
    <div className="mx-auto w-full max-w-[353px]">
      <Carousel.Root {...args} aria-label="단일 콘텐츠 배너">
        <Carousel.Viewport>
          <BannerSlides withText count={1} />
        </Carousel.Viewport>
      </Carousel.Root>
    </div>
  ),
}

const ControlledCarousel = () => {
  const [index, setIndex] = useState(0)

  return (
    <div className="mx-auto flex w-full max-w-[353px] flex-col gap-4">
      <Carousel.Root
        aria-label="제어되는 콘텐츠 배너"
        index={index}
        onIndexChange={setIndex}
      >
        <Carousel.Viewport className="aspect-[353/160] overflow-y-hidden rounded-[8px]">
          <BasicSlides />
        </Carousel.Viewport>
        <Carousel.Indicator />
      </Carousel.Root>

      <div className="flex justify-center gap-2">
        {[0, 1, 2, 3].map((itemIndex) => (
          <button
            className="border-warm-gray-100 text-cool-gray-900 rounded-[5px] border bg-white px-3 py-2 text-[12px] font-semibold"
            key={itemIndex}
            onClick={() => setIndex(itemIndex)}
            type="button"
          >
            {itemIndex + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

export const ControlledIndex: Story = {
  render: () => <ControlledCarousel />,
}

export const InteractiveChildContent: Story = {
  render: (args) => (
    <div className="mx-auto w-full max-w-[353px]">
      <Carousel.Root {...args} aria-label="상호작용 콘텐츠 배너">
        <Carousel.Viewport className="aspect-[353/160] overflow-y-hidden rounded-[8px]">
          <Carousel.Track>
            <Carousel.Item>
              <div className="bg-cool-gray-50 flex size-full flex-col items-center justify-center gap-3">
                <p className="text-cool-gray-900 m-0 text-[16px] font-semibold">
                  내부 버튼 포커스 확인
                </p>
                <button
                  className="bg-cool-gray-800 rounded-[5px] px-4 py-2 text-[14px] font-semibold text-white"
                  type="button"
                >
                  버튼
                </button>
              </div>
            </Carousel.Item>
            <Carousel.Item>
              <a
                className="text-cool-gray-900 bg-secondary-200 flex size-full items-center justify-center text-[16px] font-semibold"
                href="#carousel-link"
              >
                링크 콘텐츠
              </a>
            </Carousel.Item>
          </Carousel.Track>
        </Carousel.Viewport>
        <Carousel.Indicator />
      </Carousel.Root>
    </div>
  ),
}

export const CustomIndicatorClasses: Story = {
  render: (args) => (
    <div className="mx-auto w-full max-w-[353px]">
      <Carousel.Root {...args} aria-label="커스텀 인디케이터 배너">
        <Carousel.Viewport className="aspect-[353/160] overflow-y-hidden rounded-[8px]">
          <BasicSlides />
        </Carousel.Viewport>
        <Carousel.Indicator
          activeDotClassName="bg-primary-500"
          className="bottom-3"
          dotClassName="bg-cool-gray-200"
        />
      </Carousel.Root>
    </div>
  ),
}

export const LongContentOverflow: Story = {
  render: (args) => (
    <div className="mx-auto w-full max-w-[353px]">
      <Carousel.Root {...args} aria-label="긴 콘텐츠 배너">
        <Carousel.Viewport className="aspect-[353/160] overflow-y-hidden rounded-[8px]">
          <Carousel.Track>
            <Carousel.Item>
              <div className="bg-cool-gray-50 flex size-full flex-col justify-end gap-2 p-6">
                <p className="text-cool-gray-900 m-0 truncate text-[18px] font-bold">
                  아주 긴 제목이 들어와도 슬라이드 너비를 넘지 않도록 확인합니다
                </p>
                <p className="text-cool-gray-500 m-0 line-clamp-2 text-[14px] leading-5">
                  설명 문구가 길어지는 경우에도 호출부가 content layout을
                  구성하며 Carousel은 viewport와 snap 구조만 유지합니다.
                </p>
              </div>
            </Carousel.Item>
            <Carousel.Item>
              <PlaceholderSlide toneIndex={1}>Overflow check</PlaceholderSlide>
            </Carousel.Item>
          </Carousel.Track>
        </Carousel.Viewport>
        <Carousel.Indicator align="end" />
      </Carousel.Root>
    </div>
  ),
}
