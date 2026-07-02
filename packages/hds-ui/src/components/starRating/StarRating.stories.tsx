import type { Meta, StoryObj } from '@storybook/react-vite'
import { StarRating } from './StarRating'

const meta = {
  title: 'Components/StarRating',
  component: StarRating,
  tags: ['autodocs'],
  args: {
    value: 0,
    size: 'md',
  },
  argTypes: {
    'aria-label': {
      control: 'text',
    },
    className: {
      control: false,
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    value: {
      control: {
        type: 'number',
        min: 0,
        max: 5,
        step: 0.1,
      },
    },
  },
} satisfies Meta<typeof StarRating>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Half: Story = {
  args: {
    value: 0.5,
  },
}

export const DecimalValues: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {[1.1, 3.8, 4.1, 4.99].map((value) => (
        <StarRating key={value} value={value} />
      ))}
    </div>
  ),
}

export const IntegerValues: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {[1, 2, 3, 4, 5].map((value) => (
        <StarRating key={value} value={value} />
      ))}
    </div>
  ),
}

export const Small: Story = {
  args: {
    size: 'sm',
    value: 4.1,
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
    value: 4.1,
  },
}
