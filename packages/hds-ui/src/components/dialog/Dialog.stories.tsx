import { CheckIcon, OrderCancelIcon, PencilIcon } from '@hashi/hds-icons'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { Dialog } from './Dialog'

const mobileFrameDecorator = (Story: () => ReactNode) => (
  <div className="flex min-h-[560px] w-[393px] items-center justify-center bg-white">
    <Story />
  </div>
)

const meta = {
  title: 'Components/Dialog',
  component: Dialog.Root,
  tags: ['autodocs'],
  decorators: [mobileFrameDecorator],
  parameters: {
    docs: {
      story: {
        iframeHeight: 620,
        inline: false,
      },
    },
  },
  argTypes: {
    children: {
      control: false,
    },
  },
} satisfies Meta<typeof Dialog.Root>

export default meta

type Story = StoryObj<typeof meta>

const triggerClass =
  'rounded-[5px] bg-cool-gray-800 px-4 py-2 text-[14px] font-medium text-white'
const primaryActionClass =
  'flex h-9 items-center justify-center rounded-[5px] border-0 bg-cool-gray-800 px-4 font-sans text-[14px] font-medium leading-[1.36] text-white'
const secondaryActionClass =
  'flex h-9 items-center justify-center rounded-[5px] border-0 bg-secondary-200 px-4 font-sans text-[14px] font-medium leading-[1.36] text-black'
const largePrimaryActionClass =
  'flex h-[46px] items-center justify-center rounded-[5px] border-0 bg-cool-gray-800 px-4 font-sans text-[16px] font-semibold text-white'
const largeSecondaryActionClass =
  'flex h-[46px] items-center justify-center rounded-[5px] border-0 bg-secondary-200 px-4 font-sans text-[16px] font-semibold text-black'

const DefaultDialog = () => (
  <Dialog.Root defaultOpen>
    <Dialog.Trigger className={triggerClass}>열기</Dialog.Trigger>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Icon>
          <OrderCancelIcon />
        </Dialog.Icon>
        <div className="flex flex-col items-center gap-2">
          <Dialog.Title>정말 삭제하시겠습니까?</Dialog.Title>
          <Dialog.Description>
            삭제한 리뷰는 다시 되돌릴 수 없어요.
          </Dialog.Description>
        </div>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close className={secondaryActionClass}>취소하기</Dialog.Close>
        <button className={primaryActionClass} type="button">
          삭제하기
        </button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
)

export const Default: Story = {
  render: DefaultDialog,
}

export const ReviewAuthority: Story = {
  render: () => (
    <Dialog.Root defaultOpen>
      <Dialog.Trigger className={triggerClass}>열기</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Icon>
            <PencilIcon />
          </Dialog.Icon>
          <div className="flex flex-col items-center gap-2">
            <Dialog.Title>실제 방문자만 작성할 수 있어요</Dialog.Title>
            <Dialog.Description>
              <span className="block">리뷰는 하시를 통해 예약하고</span>
              <span className="block">방문하신 분만 남길 수 있어요!</span>
            </Dialog.Description>
          </div>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close className={primaryActionClass}>확인</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  ),
}

export const ReviewDeleteAlert: Story = {
  render: () => (
    <Dialog.Root defaultOpen type="alertdialog">
      <Dialog.Trigger className={triggerClass}>열기</Dialog.Trigger>
      <Dialog.Content className="py-[23px]">
        <Dialog.Header>
          <Dialog.Icon>
            <OrderCancelIcon />
          </Dialog.Icon>
          <div className="flex flex-col items-center gap-2">
            <Dialog.Title>정말 삭제하시겠습니까?</Dialog.Title>
            <Dialog.Description>
              삭제한 리뷰는 다시 되돌릴 수 없어요.
            </Dialog.Description>
          </div>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close className={secondaryActionClass}>취소하기</Dialog.Close>
          <button className={primaryActionClass} type="button">
            삭제하기
          </button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  ),
}

export const ReservationCancelAlert: Story = {
  render: () => (
    <Dialog.Root defaultOpen type="alertdialog">
      <Dialog.Trigger className={triggerClass}>열기</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Icon>
            <OrderCancelIcon />
          </Dialog.Icon>
          <div className="flex flex-col items-center gap-2">
            <Dialog.Title>정말 예약을 취소하시겠습니까?</Dialog.Title>
            <Dialog.Description>
              <span className="block">
                예약을 취소하면 방문 예정 내역에서 삭제되며
              </span>
              <span className="block">동일한 예약은 다시 접수해야 합니다.</span>
            </Dialog.Description>
          </div>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close className={secondaryActionClass}>취소하기</Dialog.Close>
          <button className={primaryActionClass} type="button">
            닫기
          </button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  ),
}

export const ReservationComplete: Story = {
  render: () => (
    <Dialog.Root defaultOpen>
      <Dialog.Trigger className={triggerClass}>열기</Dialog.Trigger>
      <Dialog.Content className="rounded-[20px]">
        <Dialog.Header>
          <Dialog.Icon>
            <OrderCancelIcon />
          </Dialog.Icon>
          <div className="flex flex-col items-center gap-2">
            <Dialog.Title>예약이 취소되었습니다.</Dialog.Title>
            <Dialog.Description>
              <span className="block">다른 식당으로 다시 예약을</span>
              <span className="block">요청할 수 있어요.</span>
            </Dialog.Description>
          </div>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close className={primaryActionClass}>확인</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  ),
}

const reservationRows = [
  ['예약자', '김하시'],
  ['인원', '어른 2명'],
  ['식당 주소', '도쿄 키츠라멘 본점도쿄 키츠라멘 본점'],
  ['식당 방문 일정', '2026.6.1. 11:00'],
]

export const ReservationInfo: Story = {
  render: () => (
    <Dialog.Root defaultOpen type="alertdialog">
      <Dialog.Trigger className={triggerClass}>열기</Dialog.Trigger>
      <Dialog.Content className="w-[319px] p-0">
        <Dialog.Header className="bg-cool-gray-50 w-full px-[18px] pt-[25px] pb-[21px]">
          <Dialog.Icon className="rounded-full bg-black text-white">
            <CheckIcon />
          </Dialog.Icon>
          <div className="flex flex-col items-center gap-1">
            <Dialog.Title className="text-[18px] text-black">
              예약을 진행할까요?
            </Dialog.Title>
            <Dialog.Description className="text-[12px] leading-[1.5]">
              예약 확정 시 계좌이체로 결제를 진행합니다.
            </Dialog.Description>
          </div>
        </Dialog.Header>

        <Dialog.Body className="px-6 pt-[37px]">
          <div className="flex flex-col gap-[25px]">
            {reservationRows.map(([label, value]) => (
              <div
                className="flex items-start justify-between gap-5 text-[14px] leading-[1.36]"
                key={label}
              >
                <span className="text-cool-gray-900 shrink-0 text-[15px] font-semibold">
                  {label}
                </span>
                <span className="text-cool-gray-900 max-w-[150px] text-right font-medium">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Dialog.Body>

        <div className="bg-cool-gray-50 mt-[42px] h-2 w-full" />

        <Dialog.Body className="px-6 pt-[19px]">
          <div className="flex items-center justify-between text-[16px]">
            <span className="text-cool-gray-500 font-medium">
              최종 결제 금액
            </span>
            <strong className="text-cool-gray-900 font-semibold">
              4,000원
            </strong>
          </div>
        </Dialog.Body>

        <Dialog.Footer className="mt-[22px] gap-3 px-4 pb-[17px]">
          <Dialog.Close className={largeSecondaryActionClass}>
            취소
          </Dialog.Close>
          <button className={largePrimaryActionClass} type="button">
            예약
          </button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  ),
}

export const LongTextOverflow: Story = {
  render: () => (
    <Dialog.Root defaultOpen>
      <Dialog.Trigger className={triggerClass}>열기</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Icon>
            <PencilIcon />
          </Dialog.Icon>
          <div className="flex flex-col items-center gap-2">
            <Dialog.Title>
              실제 방문자만 작성할 수 있는 아주 긴 제목입니다
            </Dialog.Title>
            <Dialog.Description>
              안내 문구가 길어져도 모바일 폭에서 dialog 바깥으로 넘치지 않고
              자연스럽게 줄바꿈되어야 합니다.
            </Dialog.Description>
          </div>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close className={primaryActionClass}>확인</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  ),
}

export const ControlledOpen: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <Dialog.Root onOpenChange={setOpen} open={open}>
        <Dialog.Trigger className={triggerClass}>열기</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>제어되는 Dialog</Dialog.Title>
            <Dialog.Description>
              open과 onOpenChange를 호출부가 관리합니다.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Dialog.Close className={primaryActionClass}>닫기</Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    )
  },
}

export const UncontrolledDefaultOpen: Story = {
  render: DefaultDialog,
}
