import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { OrderCancelModal } from './OrderCancelModal';

const meta: Meta<typeof OrderCancelModal> = {
  title: 'seller/orders/OrderCancelModal',
  component: OrderCancelModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onClose: () => {},
    onConfirm: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof OrderCancelModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    isSubmitting: false,
    errorMessage: null,
  },
};

export const Submitting: Story = {
  args: {
    isOpen: true,
    isSubmitting: true,
    errorMessage: null,
  },
};

export const WithError: Story = {
  args: {
    isOpen: true,
    isSubmitting: false,
    errorMessage: '주문 취소 처리에 실패했습니다. 다시 시도해주세요.',
  },
};
