import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Store } from '@/types/store';

import { PendingStoreDetailContent } from './PendingStoreDetailContent';

const mockStore: Store = {
  id: 'store_pending_1',
  userId: 'user_seller_2',
  name: '픽마 델리',
  businessNumber: '987-65-43210',
  phone: '02-9876-5432',
  address: '서울시 성동구 왕십리로 20',
  region: '서울 성동구',
  status: 'pending',
  description: '신선한 식재료로 만드는 델리 가게입니다.',
  createdAt: new Date('2026-04-25T00:00:00.000Z'),
  updatedAt: new Date('2026-04-25T00:00:00.000Z'),
};

const noop = () => {};

const meta = {
  title: 'admin/PendingStoreDetailContent',
  component: PendingStoreDetailContent,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    store: mockStore,
    view: 'detail' as const,
    rejectReason: '',
    isSubmitting: false,
    errorMessage: null,
    onClose: noop,
    onApproveClick: noop,
    onRejectClick: noop,
    onApproveConfirm: noop,
    onRejectConfirm: noop,
    onCancel: noop,
    onRejectReasonChange: noop,
  },
} satisfies Meta<typeof PendingStoreDetailContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Detail: Story = {};

export const ApproveConfirm: Story = {
  args: { view: 'approve-confirm' },
};

export const RejectReason: Story = {
  args: { view: 'reject-reason' },
};

export const Loading: Story = {
  args: { view: 'approve-confirm', isSubmitting: true },
};

export const ErrorState: Story = {
  args: {
    view: 'approve-confirm',
    errorMessage: '승인 처리 중 오류가 발생했습니다.',
  },
};
