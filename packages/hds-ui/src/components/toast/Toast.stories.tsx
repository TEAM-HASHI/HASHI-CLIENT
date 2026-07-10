import { CheckIcon, LinkIcon, NoteIcon } from '@hashi/hds-icons'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'

import type { ToastContent } from './Toast'

const mobileFrameDecorator = (Story: () => ReactNode) => (
  <div className="flex w-[393px] bg-white px-5 py-8">
    <Story />
  </div>
)

type ToastPreviewProps = ToastContent

const ToastPreview = ({ icon, children }: ToastPreviewProps) => (
  <div className="bg-primary-200 flex h-15 w-full items-center gap-2.75 rounded-[10px] px-5 text-white">
    {icon ? (
      <span aria-hidden="true" className="flex size-6 shrink-0">
        {icon}
      </span>
    ) : null}
    <span className="typo-long-body-1 line-clamp-2 min-w-0">{children}</span>
  </div>
)

const meta = {
  title: 'Components/Toast',
  component: ToastPreview,
  tags: ['autodocs'],
  decorators: [mobileFrameDecorator],
  args: {
    children: '링크가 복사 되었어요.',
    icon: <LinkIcon className="size-6" />,
  },
  argTypes: {
    children: {
      control: 'text',
    },
    icon: {
      control: false,
    },
  },
} satisfies Meta<typeof ToastPreview>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <ToastPreview {...args} />,
}

export const WithoutIcon: Story = {
  args: {
    icon: undefined,
    children: '저장되었습니다.',
  },
  render: (args) => <ToastPreview {...args} />,
}

export const LongText: Story = {
  args: {
    children:
      '링크가 복사 되었어요. 길이가 긴 안내 문구는 최대 두 줄까지 표시됩니다.',
  },
  render: (args) => <ToastPreview {...args} />,
}

export const Success: Story = {
  args: {
    children: '예약이 취소되었어요.',
    icon: <CheckIcon className="text-success size-6" />,
  },
  render: (args) => <ToastPreview {...args} />,
}

export const Error: Story = {
  args: {
    children: (
      <>
        예약 취소 처리 중 문제가 발생했어요.
        <br />
        잠시후 다시 시도해주세요.
      </>
    ),
    icon: <NoteIcon className="size-6" />,
  },
  render: (args) => <ToastPreview {...args} />,
}
