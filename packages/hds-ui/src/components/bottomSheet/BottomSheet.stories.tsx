import { CheckIcon, KakaoIcon, PopularIcon } from '@hashi/hds-icons'
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

const sheetFooter = (
  <div className="grid grid-cols-2 gap-[7px]">
    <Button className="typo-body-6 bg-secondary-200 h-[42px] w-full rounded-[5px] border-0 text-black">
      초기화
    </Button>
    <Button className="typo-body-6 bg-cool-gray-800 h-[42px] w-full rounded-[5px] border-0 text-white">
      적용
    </Button>
  </div>
)

type OptionListProps = {
  options: string[]
  selectedValue: string
}

const OptionList = ({ options, selectedValue }: OptionListProps) => (
  <ul className="m-0 flex list-none flex-col gap-5 p-0 pt-2">
    {options.map((option) => {
      const isSelected = option === selectedValue

      return (
        <li key={option}>
          <button
            aria-pressed={isSelected}
            className="typo-body-7 flex min-h-5 w-full items-center justify-between border-0 bg-transparent p-0 text-left text-black"
            type="button"
          >
            <span>{option}</span>
            {isSelected && (
              <CheckIcon aria-hidden="true" className="size-4 shrink-0" />
            )}
          </button>
        </li>
      )
    })}
  </ul>
)

const LoginPromptContent = () => (
  <div className="pt-1 pb-[33px]">
    <p className="typo-header-3 mt-[23px] text-black">
      <span className="block leading-[1.45] font-normal">
        간편하게 로그인하고
      </span>
      <span className="block leading-[1.45]">
        Hashi와 일본 미식 여행을 완성해보세요!
      </span>
    </p>
    <div className="flex justify-center pt-[73px] pb-[42px]">
      <PopularIcon aria-hidden="true" className="size-[172px]" />
    </div>
    <Button
      className="typo-sub-header-1 bg-point-200 relative h-[58px] gap-0 rounded-full px-[19px] text-black"
      leftIcon={
        <KakaoIcon className="absolute top-1/2 left-[19px] size-6 -translate-y-1/2" />
      }
      width="full"
    >
      카카오로 1초 만에 시작하기
    </Button>
  </div>
)

export const Default: Story = {
  render: ControlledBottomSheet,
}

export const FoodCategory: Story = {
  args: {
    open: true,
    title: '음식 장르 선택',
    children: (
      <OptionList
        options={[
          '스시/사시미류',
          '면류',
          '덮밥류',
          '나베/냄비류',
          '튀김류',
          '철판/구이류',
          '기타',
        ]}
        selectedValue="스시/사시미류"
      />
    ),
    footer: sheetFooter,
  },
  render: ControlledBottomSheet,
}

export const SortOrder: Story = {
  args: {
    open: true,
    title: '정렬 순서',
    children: (
      <OptionList
        options={['기본순', '거리순', '별점순']}
        selectedValue="기본순"
      />
    ),
    footer: sheetFooter,
  },
  render: ControlledBottomSheet,
}

export const SignupPrompt: Story = {
  args: {
    open: true,
    title: undefined,
    showCloseButton: false,
    showHandle: false,
    children: <LoginPromptContent />,
    className: 'rounded-t-[16px]',
  },
  render: ControlledBottomSheet,
}
