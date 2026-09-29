import type { Meta, StoryObj } from '@storybook/react-vite'

import { OptionItem } from './OptionItem'

const meta: Meta<typeof OptionItem> = {
  title: 'Components/OptionItem',
  component: OptionItem,
  tags: ['autodocs'],
  args: {
    children: '버튼',
    disabled: false,
    selected: false,
  },
  argTypes: {
    children: {
      control: 'text',
    },
    className: {
      control: false,
    },
    disabled: {
      control: 'boolean',
    },
    onClick: {
      control: false,
    },
    selected: {
      control: 'boolean',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[344px] bg-white">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = {
  args: {
    selected: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    selected: true,
  },
}

export const LongText: Story = {
  args: {
    children: '아주 긴 옵션 라벨이 들어왔을 때 한 줄에서 말줄임 처리되는 상태',
    selected: true,
  },
}
