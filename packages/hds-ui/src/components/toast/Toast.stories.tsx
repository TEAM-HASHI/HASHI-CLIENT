import { CheckIcon, LinkIcon, NoteIcon } from '@hashi/hds-icons'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useMemo, type ReactNode } from 'react'

import { createToastQueue, ToastRegion, type ToastContent } from './Toast'

const mobileFrameDecorator = (Story: () => ReactNode) => (
  <div className="flex w-[393px] bg-white p-5">
    <Story />
  </div>
)

type ToastPreviewProps = ToastContent

const ToastPreview = ({ icon, children }: ToastPreviewProps) => {
  const queue = useMemo(() => createToastQueue(), [])

  useEffect(() => {
    queue.clear()
    queue.add({ children, icon })
  }, [children, icon, queue])

  return <ToastRegion queue={queue} />
}

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

export const Default: Story = {}

export const WithoutIcon: Story = {
  args: {
    icon: undefined,
    children: '저장되었습니다.',
  },
}

export const LongText: Story = {
  args: {
    children:
      '링크가 복사 되었어요. 길이가 긴 안내 문구는 최대 두 줄까지 표시됩니다.',
  },
}

export const Success: Story = {
  args: {
    children: '예약이 취소되었어요.',
    icon: <CheckIcon className="text-success size-6" />,
  },
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
}
