import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Button } from '../button'
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
    height: 318,
    normalHeight: 318,
    maxHeight: 794,
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
export const Expanded: Story = { args: { height: 794 } }
export const AlternateHeights: Story = {
  args: { height: 458, normalHeight: 458, maxHeight: 682 },
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
  args: { height: 794 },
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
