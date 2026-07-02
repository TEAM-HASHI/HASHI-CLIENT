import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { Button } from '../button/Button'
import { BottomSheet, type BottomSheetProps } from './BottomSheet'

const mobileFrameDecorator = (Story: () => ReactNode) => (
  <div className="bg-cool-gray-900/70 flex min-h-[640px] w-[393px] items-end">
    <Story />
  </div>
)

const meta = {
  title: 'Components/BottomSheet',
  component: BottomSheet,
  tags: ['autodocs'],
  decorators: [mobileFrameDecorator],
  args: {
    open: true,
    onOpenChange: () => {},
    title: '바텀시트',
    children: '바텀시트 콘텐츠',
  },
  argTypes: {
    open: {
      control: 'boolean',
    },
    onOpenChange: {
      control: false,
    },
    children: {
      control: false,
    },
    footer: {
      control: false,
    },
    title: {
      control: 'text',
    },
  },
} satisfies Meta<typeof BottomSheet>

export default meta

type Story = StoryObj<typeof meta>

const ControlledBottomSheet = (args: BottomSheetProps) => {
  const [open, setOpen] = useState(args.open)

  return (
    <>
      <Button onClick={() => setOpen(true)}>바텀시트 열기</Button>
      <BottomSheet {...args} open={open} onOpenChange={setOpen} />
    </>
  )
}

const basicFooter = (
  <div className="grid grid-cols-2 gap-2">
    <Button variant="neutral" width="full">
      취소
    </Button>
    <Button width="full">확인</Button>
  </div>
)

const longContent = (
  <div className="typo-body-6 text-cool-gray-800 flex flex-col gap-3">
    <p>
      BottomSheet는 화면 하단에서 올라오는 overlay primitive입니다. 본문
      영역에는 호출부가 필요한 콘텐츠를 slot으로 전달합니다.
    </p>
    <p>
      HDS는 panel, overlay, header, footer, focus interaction과 같은 공통 동작만
      담당합니다.
    </p>
  </div>
)

export const Default: Story = {
  render: ControlledBottomSheet,
}

export const WithFooter: Story = {
  args: {
    open: true,
    title: '액션 바텀시트',
    children: '하단 액션 영역을 footer slot으로 전달할 수 있습니다.',
    footer: basicFooter,
  },
  render: ControlledBottomSheet,
}

export const WithoutCloseButton: Story = {
  args: {
    open: true,
    title: '닫기 버튼 없는 바텀시트',
    showCloseButton: false,
    children: 'showCloseButton을 false로 설정하면 닫기 버튼을 숨깁니다.',
    footer: basicFooter,
  },
  render: ControlledBottomSheet,
}

export const WithoutHeader: Story = {
  args: {
    open: true,
    title: undefined,
    showCloseButton: false,
    showHandle: false,
    'aria-label': '안내 바텀시트',
    children: 'title 없이 사용할 때는 aria-label로 접근성 이름을 전달합니다.',
    className: 'rounded-t-[16px]',
  },
  render: ControlledBottomSheet,
}

export const LongContent: Story = {
  args: {
    open: true,
    title: '긴 콘텐츠',
    children: longContent,
    footer: basicFooter,
  },
  render: ControlledBottomSheet,
}
