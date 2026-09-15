import type { Meta, StoryObj } from '@storybook/react-vite'

import { ImageFallback } from './ImageFallback'

const meta = {
  title: 'Components/ImageFallback',
  component: ImageFallback,
  tags: ['autodocs'],
  args: {
    className: 'h-[234px] w-[393px]',
  },
} satisfies Meta<typeof ImageFallback>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SmallMark: Story = {
  args: {
    className: 'size-[92px]',
    markSize: 'sm',
  },
}
