import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Chip } from './Chip'

type ChipPropsForStory = ComponentProps<typeof Chip>

type ChipPreviewItem = {
  value: string
  label: string
}

type ChipPreviewProps = {
  items: ChipPreviewItem[]
  initialValue: string
}

type ChipSinglePreviewProps = {
  items: ChipPreviewItem[]
  initialValue: string
}

const StatefulChip = (args: ChipPropsForStory) => {
  const [selected, setSelected] = useState(args.selected ?? false)

  return <Chip {...args} selected={selected} onSelectedChange={setSelected} />
}

const ChipPreview = ({ initialValue, items }: ChipPreviewProps) => {
  const [value, setValue] = useState(initialValue)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((item) => {
        const isSelected = value === item.value

        return (
          <Chip
            key={item.value}
            selected={isSelected}
            onSelectedChange={(selected) => {
              if (selected) {
                setValue(item.value)
              }
            }}
          >
            {item.label}
          </Chip>
        )
      })}
    </div>
  )
}

const ChipSinglePreview = ({ initialValue, items }: ChipSinglePreviewProps) => {
  return (
    <div className="w-fit bg-white px-9 py-8">
      <ChipPreview initialValue={initialValue} items={items} />
    </div>
  )
}

const categoryItems = [
  { value: 'popular', label: '인기순' },
  { value: 'region', label: '지역별' },
  { value: 'series', label: '시리즈별' },
  { value: 'genre', label: '장르별' },
]

const reservationFilterItems = [
  { value: 'progress', label: '진행 중' },
  { value: 'scheduled', label: '방문 예정' },
  { value: 'visited', label: '방문 완료' },
  { value: 'canceled', label: '예약 취소' },
]

const ratingSortItems = [
  { value: 'latest', label: '최신순' },
  { value: 'highRating', label: '높은 평점 순' },
  { value: 'lowRating', label: '낮은 평점 순' },
]

const simpleSortItems = [
  { value: 'popular', label: '인기순' },
  { value: 'latest', label: '최신순' },
  { value: 'rating', label: '별점순' },
]

const meta = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: {
    children: '인기순',
    selected: false,
  },
  argTypes: {
    children: {
      control: 'text',
    },
    className: {
      control: false,
    },
    onSelectedChange: {
      control: false,
    },
    selected: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Chip>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = {
  args: {
    selected: true,
  },
}

export const FilterToggle: Story = {
  render: StatefulChip,
}

export const SelectedFilterToggle: Story = {
  args: {
    selected: true,
  },
  render: StatefulChip,
}

export const LongText: Story = {
  args: {
    children: '아주 긴 칩 라벨이 들어왔을 때 말줄임 처리가 되는 상태',
    selected: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[240px]">
        <Story />
      </div>
    ),
  ],
}

export const FilterCategoryCases: Story = {
  render: () => (
    <ChipSinglePreview initialValue="popular" items={categoryItems} />
  ),
}

export const FilterReservationCases: Story = {
  render: () => (
    <ChipSinglePreview initialValue="progress" items={reservationFilterItems} />
  ),
}

export const FilterRatingCases: Story = {
  render: () => (
    <ChipSinglePreview initialValue="latest" items={ratingSortItems} />
  ),
}

export const FilterSortCases: Story = {
  render: () => (
    <ChipSinglePreview initialValue="popular" items={simpleSortItems} />
  ),
}
