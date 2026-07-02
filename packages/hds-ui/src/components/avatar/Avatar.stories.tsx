import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from './Avatar'

const avatarImageSrc =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90"%3E%3Crect width="90" height="90" fill="%23deedf4"/%3E%3Ccircle cx="45" cy="34" r="16" fill="%232d383d"/%3E%3Cpath d="M18 83c4-18 18-28 27-28s23 10 27 28" fill="%232d383d"/%3E%3C/svg%3E'

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: {
    size: 'sm',
    alt: '프로필 이미지',
  },
  argTypes: {
    src: {
      control: 'text',
    },
    alt: {
      control: 'text',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithImage: Story = {
  args: {
    src: avatarImageSrc,
  },
}

export const BrokenImage: Story = {
  args: {
    src: '/broken-avatar-image.png',
    alt: '깨진 프로필 이미지',
  },
}

export const Placeholder: Story = {}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}
