import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, type TabsProps } from './Tabs'

const mobileFrameDecorator = (Story: () => ReactNode) => (
  <div className="w-[393px] bg-white py-8">
    <Story />
  </div>
)

const StatefulTabs = (args: TabsProps) => {
  const [value, setValue] = useState(args.value)

  return <Tabs {...args} value={value} onChange={setValue} />
}

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  decorators: [mobileFrameDecorator],
  args: {
    items: [
      { value: 'info', label: '라벨' },
      { value: 'menu', label: '메뉴' },
      { value: 'review', label: '리뷰', count: 256 },
    ],
    value: 'info',
    onChange: () => undefined,
  },
  argTypes: {
    value: {
      control: false,
    },
  },
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: StatefulTabs,
}

export const TwoItems: Story = {
  args: {
    items: [
      { value: 'first', label: '라벨', count: 12 },
      { value: 'second', label: '라벨', count: 34 },
    ],
    value: 'first',
  },
  render: StatefulTabs,
}

export const FourItems: Story = {
  args: {
    items: [
      { value: 'first', label: '라벨' },
      { value: 'second', label: '라벨' },
      { value: 'third', label: '라벨' },
      { value: 'fourth', label: '라벨' },
    ],
    value: 'first',
  },
  render: StatefulTabs,
}

export const LongText: Story = {
  args: {
    items: [
      { value: 'first', label: '매장 상세 운영 정보' },
      { value: 'second', label: '대표 메뉴와 추천 조합' },
      { value: 'third', label: '방문자 리뷰 모아보기', count: 256 },
    ],
    value: 'first',
  },
  render: StatefulTabs,
}
