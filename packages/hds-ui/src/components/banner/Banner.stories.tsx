import type { Meta, StoryObj } from '@storybook/react-vite'

import { Banner, type BannerProps } from './Banner'

type BannerStoryArgs = Omit<BannerProps, 'variant' | 'title' | 'subtitle'> & {
  variant: 'withText' | 'withoutText'
  title: string
  subtitle: string
}

const renderBanner = ({
  variant,
  title,
  subtitle,
  ...args
}: BannerStoryArgs) =>
  variant === 'withText' ? (
    <Banner {...args} variant={variant} title={title} subtitle={subtitle} />
  ) : (
    <Banner {...args} variant={variant} />
  )

const imageSrc = new URL(
  '../carousel/assets/banner_magazine.png',
  import.meta.url,
).href

const meta: Meta<BannerStoryArgs> = {
  title: 'Components/Banner',
  component: renderBanner,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-[353px]">
        <Story />
      </div>
    ),
  ],
  args: {
    imageSrc,
    imageAlt: '배너 이미지',
    variant: 'withoutText',
    title: '제목제목제목제목제목',
    subtitle: '소제목소제목소제목소제목소제목',
  },
  render: renderBanner,
  argTypes: {
    imageSrc: { control: 'text' },
    imageAlt: { control: 'text' },
    variant: { control: 'select', options: ['withoutText', 'withText'] },
    title: { control: 'text', if: { arg: 'variant', eq: 'withText' } },
    subtitle: { control: 'text', if: { arg: 'variant', eq: 'withText' } },
    indicator: { control: false },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithText: Story = {
  args: {
    variant: 'withText',
    imageAlt: '',
    title: '제목제목제목제목제목',
    subtitle: '소제목소제목소제목소제목소제목',
  },
}
export const LongText: Story = {
  args: {
    ...WithText.args,
    title: '아주 긴 제목이 들어와도 배너 너비를 넘지 않도록 확인합니다',
    subtitle:
      '좁은 화면에서 긴 설명은 한 줄로 표시하고 넘치는 내용은 말줄임합니다',
  },
}
export const LinkedBanner: Story = {
  render: (args) => (
    <a
      className="block rounded-[5px] focus-visible:outline-2 focus-visible:outline-offset-2"
      href="#banner-destination"
    >
      {renderBanner(args)}
    </a>
  ),
}
