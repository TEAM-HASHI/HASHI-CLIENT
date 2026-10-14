import { CancelIcon } from '@hashi/hds-icons'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useLayoutEffect, useRef, useState } from 'react'

import { Button } from '../button'
import { Dialog } from '../dialog'
import { DragPanel } from './DragPanel'
import type { DragPanelProps } from './DragPanel'

const Preview = (args: DragPanelProps) => {
  const [height, setHeight] = useState(args.height)
  const [count, setCount] = useState(0)
  return (
    <>
      <div className="p-5">
        <Button
          variant="neutral"
          onClick={() => setCount((value) => value + 1)}
        >
          Background: {count}
        </Button>
      </div>
      <DragPanel {...args} height={height} onHeightChange={setHeight} />
    </>
  )
}

const rows = (
  <ul className="divide-cool-gray-100 divide-y px-5">
    {Array.from({ length: 30 }, (_, index) => (
      <li key={index}>
        <button
          type="button"
          className="typo-body-6 w-full py-5 text-left break-words"
        >
          Item {index + 1}
        </button>
      </li>
    ))}
  </ul>
)

const meta = {
  excludeStories: ['FullscreenPreview'],
  title: 'Components/DragPanel',
  component: DragPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'All example heights are illustrative, not map or collection design specifications.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-cool-gray-100 relative mx-auto h-[min(768px,100dvh)] w-full max-w-98.25">
        <Story />
      </div>
    ),
  ],
  args: {
    height: 240,
    normalHeight: 240,
    maxHeight: 520,
    'aria-label': 'Results',
    handleLabel: 'Panel height',
    onHeightChange: () => {},
    children: rows,
  },
  argTypes: {
    height: { control: false },
    normalHeight: { control: { type: 'number', min: 30 } },
    maxHeight: { control: { type: 'number', min: 30 } },
    children: { control: false },
    header: { control: false },
    footer: { control: false },
    onHeightChange: { control: false },
  },
  render: Preview,
} satisfies Meta<typeof DragPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Collapsed: Story = { args: { height: 30 } }
export const Expanded: Story = { args: { height: 520 } }
export const AlternateHeights: Story = {
  args: { height: 200, normalHeight: 200, maxHeight: 400 },
}
export const Empty: Story = { args: { children: null } }
export const SmallContainer: Story = {
  decorators: [
    (Story) => (
      <div className="relative h-75">
        <Story />
      </div>
    ),
  ],
  args: { height: 520 },
}
export const WithFixedSlots: Story = {
  args: {
    header: <h2 className="typo-sub-header-3 px-5 py-3">Results</h2>,
    footer: (
      <div className="p-5">
        <Button width="full">Confirm</Button>
      </div>
    ),
  },
}

// Caller-owned fullscreen composition, not part of the public HDS API.
export const FullscreenPreview = (args: DragPanelProps) => {
  const [height, setHeight] = useState(args.normalHeight)
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocus = useRef(false)

  useLayoutEffect(() => {
    if (open || !restoreFocus.current) return
    // The summary is a new session; focus its new handle after modal cleanup.
    const frame = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>('[role="slider"]')?.focus()
      restoreFocus.current = false
    })
    return () => cancelAnimationFrame(frame)
  }, [open, session])

  return (
    <>
      <div ref={panelRef}>
        <DragPanel
          key={session}
          {...args}
          height={height}
          onHeightChange={setHeight}
          onStageCommit={({ stage }) => {
            if (stage === 'maximum') setOpen(true)
          }}
        />
      </div>
      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setHeight(args.normalHeight)
            setSession((value) => value + 1)
            restoreFocus.current = true
          }
          setOpen(next)
        }}
      >
        <Dialog.Content className="fixed inset-0 flex h-dvh w-full max-w-none flex-col items-stretch gap-0 rounded-none p-0">
          <div className="flex shrink-0 items-center justify-between p-5">
            <Dialog.Title>Details</Dialog.Title>
            <Dialog.Close
              aria-label="Close details"
              className="flex size-11 items-center justify-center"
            >
              <span title="Close details">
                <CancelIcon aria-hidden="true" />
              </span>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{args.children}</div>
          <div className="shrink-0 p-5">
            <Button width="full">Confirm</Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}

export const FullscreenOnMaximum: Story = { render: FullscreenPreview }

const ResizablePreview = (args: DragPanelProps) => {
  const [small, setSmall] = useState(false)
  const [height, setHeight] = useState(args.height)
  return (
    <>
      <div className="p-5">
        <Button onClick={() => setSmall(!small)}>Resize container</Button>
      </div>
      <div className="relative" style={{ height: small ? 180 : 560 }}>
        <DragPanel {...args} height={height} onHeightChange={setHeight} />
      </div>
    </>
  )
}
export const ChangingContainer: Story = { render: ResizablePreview }
