import { BackIcon } from '@hashi/hds-icons'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Button } from '../button'
import { DragPanel, DRAG_PANEL_HEIGHTS } from './DragPanel'
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
  title: 'Components/DragPanel',
  component: DragPanel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="bg-cool-gray-100 relative mx-auto h-[min(768px,100dvh)] w-full max-w-98.25">
        <Story />
      </div>
    ),
  ],
  args: {
    height: DRAG_PANEL_HEIGHTS.normal,
    'aria-label': 'Results',
    handleLabel: 'Panel height',
    onHeightChange: () => {},
    children: rows,
    header: <h2 className="typo-sub-header-3 px-5 py-3">Results</h2>,
    footer: (
      <div className="border-cool-gray-100 border-t px-5 py-3">Footer</div>
    ),
  },
  argTypes: {
    height: { control: false },
    normalHeight: { control: { type: 'number', min: 30 } },
    maxHeight: { control: { type: 'number', min: 30 } },
    children: { control: false },
    header: { control: false },
    footer: { control: false },
    floating: { control: false },
    onHeightChange: { control: false },
  },
  render: Preview,
} satisfies Meta<typeof DragPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Collapsed: Story = { args: { height: 30 } }
export const Empty: Story = {
  args: { children: null, header: null, footer: null },
}
export const Fullscreen: Story = {
  args: {
    maxHeight: 'fullscreen',
    children: ({ isFullscreen }) => (
      <div className={isFullscreen ? 'pb-20' : undefined}>{rows}</div>
    ),
    header: ({ isFullscreen, collapse }) => (
      <div className="flex items-center gap-3 px-5 py-2">
        {isFullscreen && (
          <button
            type="button"
            aria-label="Back to panel"
            title="Back to panel"
            onClick={collapse}
            className="flex size-11 items-center justify-center"
          >
            <BackIcon aria-hidden="true" />
          </button>
        )}
        <h2 className="typo-sub-header-3">Results</h2>
      </div>
    ),
    footer: null,
    floating: ({ isFullscreen, collapse }) =>
      isFullscreen && (
        <Button className="absolute right-5 bottom-5" onClick={collapse}>
          Return to panel
        </Button>
      ),
  },
}

const ResizablePreview = (args: DragPanelProps) => {
  const [small, setSmall] = useState(false)
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 p-4">
        <Button onClick={() => setSmall(!small)}>Resize container</Button>
      </div>
      <div className="min-h-0 flex-1">
        <div className="relative" style={{ height: small ? '45%' : '100%' }}>
          <Preview {...args} />
        </div>
      </div>
    </div>
  )
}
export const ChangingContainer: Story = { render: ResizablePreview }
