import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, type TabsProps } from './Tabs'

const StatefulTabs = (args: TabsProps) => {
  const [value, setValue] = useState(args.value)

  return <Tabs {...args} value={value} onChange={setValue} />
}

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: {
    items: [
      { value: 'info', label: '매장 정보' },
      { value: 'menu', label: '메뉴' },
      { value: 'review', label: '리뷰', count: 256 },
    ],
    value: 'info',
    onChange: () => undefined,
  },
  argTypes: {
    value: {
      control: 'select',
      options: ['info', 'menu', 'review'],
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
      { value: 'write', label: '리뷰 쓰기', count: 1 },
      { value: 'written', label: '작성한 리뷰', count: 4 },
    ],
    value: 'write',
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
