import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'
import { useState } from 'react'

import { SearchBar } from './SearchBar'

const meta: Meta<typeof SearchBar> = {
  title: 'Components/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  args: {
    'aria-label': '검색',
    placeholder: '플레이스홀더',
  },
  argTypes: {
    className: {
      control: false,
    },
    icon: {
      control: 'boolean',
    },
    inputClassName: {
      control: false,
    },
    onChange: {
      control: false,
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[353px] bg-white p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

type SearchBarStoryProps = ComponentProps<typeof SearchBar>

const ControlledSearchBar = (args: SearchBarStoryProps) => {
  const [value, setValue] = useState('텍스트')

  return (
    <SearchBar
      {...args}
      onChange={(event) => {
        setValue(event.target.value)
      }}
      value={value}
    />
  )
}

export const Default: Story = {}

export const WithValue: Story = {
  args: {
    defaultValue: '텍스트',
  },
}

export const WithoutIcon: Story = {
  args: {
    icon: false,
  },
}

export const WithoutIconWithValue: Story = {
  args: {
    defaultValue: '텍스트',
    icon: false,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: '텍스트',
  },
}

export const FocusState: Story = {
  args: {
    autoFocus: true,
  },
}

export const LongPlaceholderOverflow: Story = {
  args: {
    placeholder: '긴 플레이스홀더가 들어와도 레이아웃이 깨지지 않습니다',
  },
  decorators: [
    (Story) => (
      <div className="w-[240px] bg-white p-4">
        <Story />
      </div>
    ),
  ],
}

export const LongValueOverflow: Story = {
  args: {
    value: '긴 검색어가 입력되어도 오른쪽 둥근 경계에 붙지 않습니다',
    readOnly: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[240px] bg-white p-4">
        <Story />
      </div>
    ),
  ],
}

export const MobileViewport430: Story = {
  decorators: [
    (Story) => (
      <div className="w-[430px] bg-white p-5">
        <Story />
      </div>
    ),
  ],
}

export const Controlled: Story = {
  render: ControlledSearchBar,
}

export const Uncontrolled: Story = {
  args: {
    defaultValue: '텍스트',
  },
}
