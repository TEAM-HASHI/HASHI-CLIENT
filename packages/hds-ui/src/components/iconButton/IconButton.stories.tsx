import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconButton } from './IconButton'

const BackIcon = () => (
  <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
    <path
      d="M15 5L8 12L15 19"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

const ShareIcon = () => (
  <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
    <path
      d="M12 15V4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.8"
    />
    <path
      d="M8 8L12 4L16 8"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <path
      d="M6 12V20H18V12"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
)

const EditIcon = () => (
  <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
    <path
      d="M5 19L6.2 14.5L15.4 5.3C16.1 4.6 17.2 4.6 17.9 5.3L18.7 6.1C19.4 6.8 19.4 7.9 18.7 8.6L9.5 17.8L5 19Z"
      fill="currentColor"
    />
  </svg>
)

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: {
    'aria-label': '뒤로가기',
    children: <BackIcon />,
    size: 'md',
    type: 'button',
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
      options: ['xs', 'md'],
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

export const TopbarAction: Story = {
  args: {
    'aria-label': '뒤로가기',
    children: <BackIcon />,
    size: 'xs',
  },
  decorators: [
    (Story) => (
      <div className="text-cool-gray-900 flex w-[24.5625rem] items-center justify-between px-5 py-6">
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
    children: <ShareIcon />,
    size: 'xs',
  },
}

export const EditAction: Story = {
  args: {
    'aria-label': '수정하기',
    children: <EditIcon />,
    className: 'rounded-full bg-white shadow-sm',
    size: 'md',
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
        <BackIcon />
      </IconButton>
      <IconButton aria-label="수정하기" size="md">
        <EditIcon />
      </IconButton>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    'aria-label': '공유하기',
    children: <ShareIcon />,
    disabled: true,
    size: 'xs',
  },
}

export const Loading: Story = {
  args: {
    'aria-label': '저장 중',
    children: <EditIcon />,
    loading: true,
  },
}

export const WiderTopbarHitArea: Story = {
  render: () => (
    <div className="text-cool-gray-900 flex w-[24.5625rem] items-center justify-between px-2 py-4">
      <IconButton
        aria-label="뒤로가기"
        className="-m-2.5 box-content p-2.5"
        size="xs"
      >
        <BackIcon />
      </IconButton>
      <span className="typo-sub-header-2">식당 상세 정보</span>
      <IconButton
        aria-label="공유하기"
        className="-m-2.5 box-content p-2.5"
        size="xs"
      >
        <ShareIcon />
      </IconButton>
    </div>
  ),
}
