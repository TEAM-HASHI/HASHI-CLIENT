import type { Meta, StoryObj } from '@storybook/react-vite'
import { ExpandableText } from './ExpandableText'

const longText =
  '정말 맛있습니다 와우!!! 정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!'

const meta: Meta<typeof ExpandableText> = {
  title: 'Components/ExpandableText',
  component: ExpandableText,
  tags: ['autodocs'],
  args: {
    text: longText,
  },
  argTypes: {
    text: {
      control: 'text',
    },
    defaultExpanded: {
      control: 'boolean',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[353px] p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Expanded: Story = {
  args: {
    defaultExpanded: true,
  },
}

export const ShortText: Story = {
  args: {
    text: '정말 맛있습니다 와우!!!',
  },
}

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <ExpandableText {...args} />
      <ExpandableText {...args} defaultExpanded />
    </div>
  ),
}
