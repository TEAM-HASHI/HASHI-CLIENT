import { CheckIcon } from '@hashi/hds-icons'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../button'
import { InputField, type InputFieldProps } from './InputField'

const inputFrameClassName = 'w-86.25 max-w-full'
const actionButtonClassName =
  'h-8.25 w-21.5 rounded-[5px] px-0 text-[12px] font-medium leading-none'

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
  <span className="border-success text-success inline-flex size-5.5 items-center justify-center rounded-full border">
    <CheckIcon className="size-5.5" />
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
  parameters: {
    docs: {
      description: {
        story:
          'Tab으로 input과 우측 버튼을 차례로 선택합니다. input에만 박스 outline이 표시되고, 버튼에서는 버튼 자체의 focus 표시를 확인합니다.',
      },
    },
  },
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

export const Filled: Story = {
  args: { defaultValue: '텍스트' },
}

export const LongText: Story = {
  args: {
    label: '긴 입력값',
    defaultValue:
      '아주 긴 입력값도 입력 영역 안에서 스크롤할 수 있어야 합니다.'.repeat(4),
    rightElement: renderActionButton('확인'),
  },
}

export const DisabledWithAction: Story = {
  args: { disabled: true, rightElement: renderActionButton('확인') },
}
