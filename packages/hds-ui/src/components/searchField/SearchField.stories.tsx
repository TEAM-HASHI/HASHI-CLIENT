import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'
import { useState } from 'react'

import { SearchField } from './SearchField'

const meta: Meta<typeof SearchField> = {
  title: 'Components/SearchField',
  component: SearchField,
  tags: ['autodocs'],
  args: {
    'aria-label': '식당 또는 메뉴 검색',
    placeholder: '식당 혹은 메뉴를 검색해보세요',
  },
  argTypes: {
    className: {
      control: false,
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

type SearchFieldStoryProps = ComponentProps<typeof SearchField>

const ControlledSearchField = (args: SearchFieldStoryProps) => {
  const [value, setValue] = useState('초밥')

  return (
    <SearchField
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
    value: '연어 덮밥',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: '검색 비활성화',
  },
}

export const FocusState: Story = {
  args: {
    autoFocus: true,
  },
}

export const LongPlaceholderOverflow: Story = {
  args: {
    placeholder:
      '식당 이름, 메뉴, 지역명처럼 긴 검색어 안내 문구가 들어와도 레이아웃이 깨지지 않습니다',
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
  render: ControlledSearchField,
}

export const Uncontrolled: Story = {
  args: {
    defaultValue: '라멘',
  },
}
