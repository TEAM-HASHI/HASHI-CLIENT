import type { Meta, StoryObj } from '@storybook/react-vite'

import { Thumbnail } from './Thumbnail'

const thumbnailImageSrc =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135 135"%3E%3Crect width="135" height="135" fill="%23d9e8df"/%3E%3Ccircle cx="68" cy="68" r="38" fill="%233d6b52"/%3E%3C/svg%3E'

const meta = {
  title: 'Components/Thumbnail',
  component: Thumbnail,
  tags: ['autodocs'],
  args: {
    alt: '식당 이미지',
    size: 'md',
    src: thumbnailImageSrc,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Thumbnail>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Fallback: Story = {
  args: {
    src: undefined,
  },
}

export const BrokenImage: Story = {
  args: {
    src: '/broken-thumbnail.png',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}
