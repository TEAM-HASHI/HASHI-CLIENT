import {
  HomeIcon,
  MapIcon,
  MyIcon,
  MyReservationIcon,
  SaveIcon,
} from '@hashi/hds-icons'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps, ReactNode } from 'react'
import { useState } from 'react'
import { BottomNavigation, type BottomNavigationItem } from './BottomNavigation'

const defaultItems = [
  { value: 'home', label: '홈', icon: <HomeIcon /> },
  { value: 'save', label: '저장', icon: <SaveIcon /> },
  { value: 'map', label: '지도', icon: <MapIcon /> },
  {
    value: 'reservation',
    label: '내 예약',
    icon: <MyReservationIcon />,
  },
  { value: 'my', label: '마이', icon: <MyIcon /> },
] satisfies BottomNavigationItem[]

const mobileFrameDecorator = (Story: () => ReactNode) => (
  <div className="w-[393px] bg-white">
    <Story />
  </div>
)

const meta = {
  title: 'Components/BottomNavigation',
  component: BottomNavigation,
  tags: ['autodocs'],
  decorators: [mobileFrameDecorator],
  args: {
    items: defaultItems,
    value: 'home',
  },
  argTypes: {
    items: {
      control: false,
    },
    onValueChange: {
      control: false,
    },
    value: {
      control: 'select',
      options: defaultItems.map((item) => item.value),
    },
  },
} satisfies Meta<typeof BottomNavigation>

export default meta

type Story = StoryObj<typeof meta>

const StatefulBottomNavigation = (args: BottomNavigationPropsForStory) => {
  const [value, setValue] = useState(args.value)

  return <BottomNavigation {...args} value={value} onValueChange={setValue} />
}

type BottomNavigationPropsForStory = ComponentProps<typeof BottomNavigation>

export const Default: Story = {
  render: StatefulBottomNavigation,
}

export const ActiveSave: Story = {
  args: {
    value: 'save',
  },
}

export const ActiveMap: Story = {
  args: {
    value: 'map',
  },
}

export const ActiveReservation: Story = {
  args: {
    value: 'reservation',
  },
}

export const ActiveMy: Story = {
  args: {
    value: 'my',
  },
}

export const LongLabelOverflow: Story = {
  args: {
    items: [
      { value: 'home', label: '홈', icon: <HomeIcon /> },
      { value: 'save', label: '저장한 식당', icon: <SaveIcon /> },
      { value: 'map', label: '지도에서 찾기', icon: <MapIcon /> },
      {
        value: 'reservation',
        label: '나의 예약 현황',
        icon: <MyReservationIcon />,
      },
      { value: 'my', label: '마이페이지', icon: <MyIcon /> },
    ],
    value: 'reservation',
  },
}
