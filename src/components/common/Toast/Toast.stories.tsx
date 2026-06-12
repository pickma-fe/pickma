import type { Meta, StoryObj } from '@storybook/react-vite';

import { Toast } from './Toast';

const meta = {
  title: 'common/Toast',
  component: Toast,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    onClose: () => {},
  },
  argTypes: {
    toast: { control: false },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    toast: { id: '1', message: '새 주문이 접수되었습니다', type: 'success' },
  },
};

export const Error: Story = {
  args: {
    toast: { id: '2', message: '오류가 발생했습니다', type: 'error' },
  },
};

export const Info: Story = {
  args: {
    toast: { id: '3', message: '주문이 접수되었습니다', type: 'info' },
  },
};

export const OrderAccepted: Story = {
  args: {
    toast: { id: '4', message: '주문이 접수되었습니다', type: 'success' },
  },
};

export const OrderReady: Story = {
  args: {
    toast: { id: '5', message: '준비가 완료되었습니다', type: 'success' },
  },
};

export const OrderCompleted: Story = {
  args: {
    toast: { id: '6', message: '픽업이 완료되었습니다', type: 'info' },
  },
};
