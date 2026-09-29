import { BackIcon, PencilIcon, ShareIcon } from '@hashi/hds-icons'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconButton } from './IconButton'

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: {
    'aria-label': '뒤로가기',
    children: <BackIcon className="size-6" />,
    size: 'md',
    type: 'button',
    variant: 'plain',
  },
  argTypes: {
    'aria-label': {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md'],
    },
    variant: {
      control: 'select',
      options: ['plain', 'soft'],
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
  },
} satisfies Meta<typeof IconButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="bg-secondary-200 text-cool-gray-900 flex items-center gap-4 p-4">
      <IconButton aria-label="기본 수정 버튼" variant="plain">
        <PencilIcon className="size-6" />
      </IconButton>
      <IconButton aria-label="부드러운 수정 버튼" size="sm" variant="soft">
        <PencilIcon className="size-[25px]" />
      </IconButton>
    </div>
  ),
}

export const TopbarAction: Story = {
  args: {
    'aria-label': '뒤로가기',
    children: <BackIcon className="size-6" />,
    size: 'xs',
  },
  decorators: [
    (Story) => (
      <div className="text-cool-gray-900 flex w-[393px] max-w-full items-center justify-between px-5 py-6">
        <Story />
        <span className="typo-sub-header-2">리뷰 상세</span>
        <span className="size-6" />
      </div>
    ),
  ],
}

export const ShareAction: Story = {
  args: {
    'aria-label': '공유하기',
    children: <ShareIcon className="size-6" />,
    size: 'xs',
  },
}

export const EditAction: Story = {
  args: {
    'aria-label': '수정하기',
    children: <PencilIcon className="size-[25px]" />,
    size: 'sm',
    variant: 'soft',
  },
  decorators: [
    (Story) => (
      <div className="bg-secondary-200 text-cool-gray-900 p-4">
        <Story />
      </div>
    ),
  ],
}

export const Sizes: Story = {
  render: () => (
    <div className="text-cool-gray-900 flex items-center gap-4">
      <IconButton aria-label="뒤로가기" size="xs">
        <BackIcon className="size-6" />
      </IconButton>
      <IconButton aria-label="부드러운 수정하기" size="sm" variant="soft">
        <PencilIcon className="size-[25px]" />
      </IconButton>
      <IconButton aria-label="수정하기" size="md">
        <PencilIcon className="size-6" />
      </IconButton>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    'aria-label': '공유하기',
    children: <ShareIcon className="size-6" />,
    disabled: true,
    size: 'sm',
    variant: 'soft',
  },
}

export const Loading: Story = {
  args: {
    'aria-label': '저장 중',
    children: <PencilIcon className="size-[25px]" />,
    loading: true,
    size: 'sm',
    variant: 'soft',
  },
}

export const WiderTopbarHitArea: Story = {
  render: () => (
    <div className="text-cool-gray-900 flex w-[393px] max-w-full items-center justify-between px-2 py-4">
      <IconButton
        aria-label="뒤로가기"
        className="-m-2.5 box-content p-2.5"
        size="xs"
      >
        <BackIcon className="size-6" />
      </IconButton>
      <span className="typo-sub-header-2">식당 상세 정보</span>
      <IconButton
        aria-label="공유하기"
        className="-m-2.5 box-content p-2.5"
        size="xs"
      >
        <ShareIcon className="size-6" />
      </IconButton>
    </div>
  ),
}
