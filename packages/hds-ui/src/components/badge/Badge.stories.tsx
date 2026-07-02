import {
  CameraIcon,
  CleanIcon,
  DeliciousIcon,
  FastIcon,
  LeafIcon,
  MoneyIcon,
  PeopleIcon,
  SmileIcon,
  SoloIcon,
  TalkIcon,
} from '@hashi/hds-icons'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps, ReactNode } from 'react'
import { useState } from 'react'
import { Badge } from './Badge'

const reviewKeywordItems = [
  { value: 'kind', label: '친절해요', icon: <SmileIcon /> },
  { value: 'delicious', label: '음식이 맛있어요', icon: <DeliciousIcon /> },
  { value: 'solo', label: '혼밥하기 좋아요', icon: <SoloIcon /> },
  { value: 'fast', label: '음식이 빨리 나와요', icon: <FastIcon /> },
  { value: 'mildSpice', label: '향신료가 강하지 않아요', icon: <LeafIcon /> },
  { value: 'spacious', label: '매장이 넓어요', icon: <PeopleIcon /> },
  { value: 'clean', label: '매장이 청결해요', icon: <CleanIcon /> },
  { value: 'photo', label: '사진이 잘 나와요', icon: <CameraIcon /> },
  { value: 'value', label: '가성비가 좋아요', icon: <MoneyIcon /> },
  { value: 'talk', label: '대화하기 좋아요', icon: <TalkIcon /> },
]

const mobileFrameDecorator = (Story: () => ReactNode) => (
  <div className="w-[393px] bg-white p-5">
    <Story />
  </div>
)

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  decorators: [mobileFrameDecorator],
  args: {
    label: '친절해요',
    icon: <SmileIcon />,
  },
  argTypes: {
    icon: {
      control: false,
    },
    interactive: {
      control: 'boolean',
    },
    selected: {
      control: 'boolean',
    },
    onSelectedChange: {
      control: false,
    },
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>
type BadgePropsForStory = ComponentProps<typeof Badge>
type ReviewKeywordItem = (typeof reviewKeywordItems)[number]

const StatefulBadge = (args: BadgePropsForStory) => {
  const [selected, setSelected] = useState(Boolean(args.selected))

  return (
    <Badge
      {...args}
      interactive
      onSelectedChange={setSelected}
      selected={selected}
    />
  )
}

const KeywordWrap = ({
  interactive = false,
  selectedValues = [],
}: {
  interactive?: boolean
  selectedValues?: string[]
}) => {
  const [selectedKeywordValues, setSelectedKeywordValues] =
    useState(selectedValues)

  return (
    <div className="flex max-w-[353px] flex-wrap gap-2">
      {reviewKeywordItems.map((item) => {
        const isSelected = selectedKeywordValues.includes(item.value)

        if (interactive) {
          return (
            <Badge
              icon={item.icon}
              interactive
              key={item.value}
              label={item.label}
              onSelectedChange={(nextSelected) => {
                setSelectedKeywordValues((currentValues) =>
                  getNextSelectedKeywordValues(
                    currentValues,
                    item,
                    nextSelected,
                  ),
                )
              }}
              selected={isSelected}
            />
          )
        }

        return <Badge icon={item.icon} key={item.value} label={item.label} />
      })}
    </div>
  )
}

const getNextSelectedKeywordValues = (
  currentValues: string[],
  item: ReviewKeywordItem,
  nextSelected: boolean,
) => {
  if (nextSelected) {
    return [...currentValues, item.value]
  }

  return currentValues.filter((value) => value !== item.value)
}

export const Default: Story = {}

export const WithIcon: Story = {
  args: {
    icon: <SmileIcon />,
    label: '친절해요',
  },
}

export const Selectable: Story = {
  args: {
    icon: <DeliciousIcon />,
    interactive: true,
    label: '음식이 맛있어요',
  },
  render: StatefulBadge,
}

export const Selected: Story = {
  args: {
    icon: <LeafIcon />,
    interactive: true,
    label: '향신료가 강하지 않아요',
    selected: true,
  },
  render: StatefulBadge,
}

export const StaticReviewKeywords: Story = {
  render: () => <KeywordWrap />,
}

export const SelectableReviewKeywords: Story = {
  render: () => (
    <KeywordWrap
      interactive
      selectedValues={['delicious', 'mildSpice', 'value']}
    />
  ),
}

export const LongText: Story = {
  args: {
    icon: <LeafIcon />,
    label: '향신료가 강하지 않아요',
  },
  render: (args) => (
    <div className="w-[140px]">
      <Badge {...args} />
    </div>
  ),
}
