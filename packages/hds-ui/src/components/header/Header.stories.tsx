import { BackIcon, ShareIcon } from '@hashi/hds-icons'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'

import { IconButton } from '../iconButton'
import { Header } from './Header'

const mobileFrameDecorator = (Story: () => ReactNode) => (
  <div className="w-[393px] max-w-full bg-white">
    <Story />
  </div>
)

const backAction = (
  <IconButton aria-label="뒤로가기" size="xs">
    <BackIcon className="size-6" />
  </IconButton>
)

const shareAction = (
  <IconButton aria-label="공유하기" size="xs">
    <ShareIcon className="size-6" />
  </IconButton>
)

const meta = {
  title: 'Components/Header',
  component: Header,
  tags: ['autodocs'],
  decorators: [mobileFrameDecorator],
  args: {
    leftAction: backAction,
    title: '예약 상세',
    variant: 'center',
  },
  argTypes: {
    className: {
      control: false,
    },
    contentClassName: {
      control: false,
    },
    leftAction: {
      control: false,
    },
    rightAction: {
      control: false,
    },
    subtitle: {
      control: 'text',
    },
    title: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['center', 'largeTitle'],
    },
  },
} satisfies Meta<typeof Header>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithRightAction: Story = {
  args: {
    rightAction: shareAction,
    title: '오늘의 식당',
  },
}

export const TitleOnly: Story = {
  args: {
    leftAction: undefined,
    title: '매거진',
  },
}

export const Subtitle: Story = {
  args: {
    subtitle: '최종 업데이트: 2026. 06. 29',
    title: '개인정보 수집 및 이용 동의',
  },
}

export const LargeTitle: Story = {
  args: {
    rightAction: shareAction,
    title: '야키니쿠 리키마루 이케부쿠로 히가시구치 텐',
    variant: 'largeTitle',
  },
}
