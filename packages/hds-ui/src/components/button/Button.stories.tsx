import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const DotIcon = () => (
  <span className="block size-4 rounded-full bg-current" aria-hidden="true" />
)

const ArrowIcon = () => (
  <span className="text-[0.875rem] leading-none" aria-hidden="true">
    {'>'}
  </span>
)

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: '탈퇴하기',
    type: 'button',
    variant: 'primary',
    size: 'lg',
    width: 'fit',
  },
  argTypes: {
    children: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['primary', 'neutral'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    width: {
      control: 'select',
      options: ['fit', 'full'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
    leftIcon: {
      control: false,
    },
    rightIcon: {
      control: false,
    },
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="neutral">돌아가기</Button>
      <Button variant="primary">탈퇴하기</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
}

export const FullWidth: Story = {
  args: {
    children: '탈퇴하기',
    width: 'full',
  },
  decorators: [
    (Story) => (
      <div className="w-[22.0625rem] max-w-full">
        <Story />
      </div>
    ),
  ],
}

export const WithdrawalActions: Story = {
  render: () => (
    <div className="flex w-[25.125rem] max-w-full gap-[0.8125rem]">
      <Button variant="neutral" size="lg" width="full">
        돌아가기
      </Button>
      <Button variant="primary" size="lg" width="full">
        탈퇴하기
      </Button>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    children: '처리 중',
    loading: true,
  },
}

export const WithLeftIcon: Story = {
  args: {
    children: '리뷰 작성하기',
    leftIcon: <DotIcon />,
    size: 'sm',
  },
}

export const WithRightIcon: Story = {
  args: {
    children: '더보기',
    rightIcon: <ArrowIcon />,
    variant: 'neutral',
    size: 'sm',
  },
}

export const WithBothIcons: Story = {
  args: {
    children: '다음 단계로 이동',
    leftIcon: <DotIcon />,
    rightIcon: <ArrowIcon />,
  },
}

export const LongLabel: Story = {
  args: {
    children: '아주 긴 버튼 문구가 들어와도 부모 영역을 벗어나지 않습니다',
    width: 'full',
  },
  decorators: [
    (Story) => (
      <div className="w-[15rem] max-w-full">
        <Story />
      </div>
    ),
  ],
}
