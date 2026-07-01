import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from './Textarea'

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: {
    placeholder: '내용을 입력해 주세요.',
    helperText: '도움말을 입력할 수 있습니다.',
    maxLength: 1000,
    disabled: false,
    showCounter: undefined,
  },
  argTypes: {
    placeholder: {
      control: 'text',
    },
    helperText: {
      control: 'text',
    },
    maxLength: {
      control: 'number',
    },
    disabled: {
      control: 'boolean',
    },
    showCounter: {
      control: 'boolean',
    },
    value: {
      control: false,
    },
    defaultValue: {
      control: 'text',
    },
    onChange: {
      control: false,
    },
  },
} satisfies Meta<typeof Textarea>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ReviewExample: Story = {
  args: {
    placeholder: '리뷰를 작성해 주세요.',
    helperText: '10자 이상',
    maxLength: 1000,
  },
}

export const Disabled: Story = {
  args: {
    placeholder: '비활성 상태입니다.',
    helperText: '입력할 수 없습니다.',
    maxLength: 1000,
    disabled: true,
  },
}
