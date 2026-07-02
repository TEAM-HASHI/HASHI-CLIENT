import { CheckIcon } from '@hashi/hds-icons'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../button'
import { InputField, type InputFieldProps } from './InputField'

const inputFrameClassName = 'w-[345px] max-w-full'
const actionButtonClassName =
  'h-[33px] w-[86px] rounded-[5px] px-0 text-[12px] font-medium leading-none'

const renderActionButton = (children: string, disabled = false) => (
  <Button
    size="sm"
    variant={disabled ? 'neutral' : 'primary'}
    className={actionButtonClassName}
    disabled={disabled}
  >
    {children}
  </Button>
)

const renderSuccessIcon = () => (
  <span className="border-success text-success inline-flex size-[22px] items-center justify-center rounded-full border">
    <CheckIcon className="size-[22px]" />
  </span>
)

const meta: Meta<InputFieldProps> = {
  title: 'Components/InputField',
  component: InputField,
  tags: ['autodocs'],
  args: {
    'aria-label': '입력 필드',
    placeholder: '내용을 입력해 주세요.',
  },
  argTypes: {
    label: {
      control: 'text',
    },
    'aria-label': {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    value: {
      control: 'text',
    },
    defaultValue: {
      control: 'text',
    },
    rightIcon: {
      control: false,
    },
    rightElement: {
      control: false,
    },
    onChange: {
      control: false,
    },
  },
  decorators: [
    (Story) => (
      <div className={inputFrameClassName}>
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<InputFieldProps>

export const Default: Story = {
  args: {
    'aria-label': '입력 필드',
  },
}

export const WithLabel: Story = {
  args: {
    label: '라벨',
    placeholder: '내용을 입력해 주세요.',
  } satisfies InputFieldProps,
}

export const WithRightElement: Story = {
  args: {
    label: '라벨',
    placeholder: '내용을 입력해 주세요.',
    rightElement: renderActionButton('버튼'),
  },
}

export const WithRightIcon: Story = {
  args: {
    'aria-label': '상태 입력',
    placeholder: '내용을 입력해 주세요.',
    rightIcon: renderSuccessIcon(),
  },
}

export const WithRightIconAndElement: Story = {
  args: {
    'aria-label': '상태 입력',
    placeholder: '내용을 입력해 주세요.',
    rightIcon: renderSuccessIcon(),
    rightElement: renderActionButton('확인'),
  },
}

export const Disabled: Story = {
  args: {
    label: '라벨',
    placeholder: '내용을 입력해 주세요.',
    disabled: true,
  },
}

export const PhoneVerificationExample: Story = {
  args: {
    label: '연락처',
    value: '010-7875-7856',
    readOnly: true,
    rightElement: renderActionButton('인증하기'),
  } satisfies InputFieldProps,
}

export const CodeVerificationExample: Story = {
  args: {
    value: '4846',
    readOnly: true,
    'aria-label': '인증번호',
    rightIcon: renderSuccessIcon(),
    rightElement: renderActionButton('확인'),
  } satisfies InputFieldProps,
}
