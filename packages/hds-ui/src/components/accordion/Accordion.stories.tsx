import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Accordion } from './Accordion'

const termsContent =
  '본 동의서는 Hashi가 이용자의 식당 예약을 진행하기 위해 개인정보를 예약 대상 식당에 제공하는 것에 관한 내용을 안내하는 것을 목적으로 합니다.'

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  args: {
    title: '제1조 (목적)',
    children: termsContent,
  },
  argTypes: {
    title: {
      control: 'text',
    },
    children: {
      control: 'text',
    },
    headingLevel: {
      control: 'select',
      options: [2, 3, 4, 5, 6],
    },
    defaultExpanded: {
      control: 'boolean',
    },
    expanded: {
      control: 'boolean',
    },
    onExpandedChange: {
      action: 'expanded changed',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[393px] max-w-full">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

export const Collapsed: Story = {}

export const Expanded: Story = {
  args: {
    defaultExpanded: true,
  },
}

export const LongTitle: Story = {
  args: {
    title:
      '제1조 (목적) 개인정보 제공 동의 및 식당 예약 진행을 위한 긴 약관 제목',
  },
}

export const Controlled: Story = {
  render: (args) => {
    const [expanded, setExpanded] = useState(false)

    return (
      <Accordion {...args} expanded={expanded} onExpandedChange={setExpanded} />
    )
  },
}
