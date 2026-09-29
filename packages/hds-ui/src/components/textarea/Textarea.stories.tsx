import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from './Textarea'

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-86.5 max-w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    'aria-label': '내용',
    placeholder: '내용을 입력해 주세요.',
    helperText: undefined,
    maxLength: 1000,
    disabled: false,
    showCounter: undefined,
  },
  argTypes: {
    maxLengthBehavior: { control: 'select', options: ['prevent', 'allow'] },
    errorMessage: { control: 'text' },
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
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ReviewExample: Story = {
  args: {
    placeholder: '리뷰를 작성해 주세요.',
    textareaClassName: 'min-h-57.5',
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

export const AllowOverLimit: Story = {
  args: {
    maxLength: 10,
    maxLengthBehavior: 'allow',
    errorMessage: '글자 수 제한을 초과했어요.',
    placeholder: '10자를 넘게 입력해 보세요.',
  },
}

export const OverLimit: Story = {
  args: {
    maxLength: 1000,
    maxLengthBehavior: 'allow',
    defaultValue: '가'.repeat(1200),
    errorMessage: '글자 수 제한을 초과했어요.',
  },
}

export const LongHelperText: Story = {
  args: {
    helperText:
      '입력한 내용을 확인해주세요. 긴 안내 문구도 작은 화면에서 잘리지 않고 모두 읽을 수 있어야 합니다.',
  },
}
