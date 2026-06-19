import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { OrderCompleteConfirmModal } from './OrderCompleteConfirmModal';

const meta: Meta<typeof OrderCompleteConfirmModal> = {
  title: 'seller/orders/OrderCompleteConfirmModal',
  component: OrderCompleteConfirmModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onClose: () => {},
    onConfirm: () => {},
    orderNumber: 'PM20260617ABCD',
    pickupNumber: '42',
    storeOrderNumber: '7',
  },
};

export default meta;
type Story = StoryObj<typeof OrderCompleteConfirmModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    isSubmitting: false,
  },
};

export const Submitting: Story = {
  args: {
    isOpen: true,
    isSubmitting: true,
  },
};

export const NoPickupNumber: Story = {
  args: {
    isOpen: true,
    isSubmitting: false,
    pickupNumber: null,
    storeOrderNumber: null,
  },
};
