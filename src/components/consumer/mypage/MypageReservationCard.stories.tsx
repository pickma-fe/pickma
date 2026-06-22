import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import type { OrderStatus } from '@/types/order';

import { MypageReservationCard } from './MypageReservationCard';
import type { MypageReservation } from './mypageReservationMapper';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta = {
  title: 'consumer/mypage/MypageReservationCard',
  component: MypageReservationCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof MypageReservationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const statusLabels: Record<OrderStatus, string> = {
  paymentPending: '결제 대기',
  processing: '처리 중',
  reserved: '예약 완료',
  accepted: '예약 접수',
  ready: '픽업 준비 완료',
  completed: '픽업 완료',
  cancelled: '취소 완료',
  cancelling: '취소 처리 중',
  noShow: '노쇼',
  expired: '예약 만료',
};

function createReservation(
  status: OrderStatus,
  overrides?: Partial<MypageReservation>
): MypageReservation {
  return {
    id: `reservation-${status}`,
    orderNumber: `PM-${status.toUpperCase()}`,
    storeName: '성수 베이커리',
    productName: `${statusLabels[status]} 할인 세트`,
    imageUrl: '/images/fallback/bread.jpg',
    pickupDate: '2026. 06. 22. 월',
    pickupTime: '18:00 ~ 19:00',
    pickupCode: ['reserved', 'accepted', 'ready'].includes(status)
      ? 'A-102'
      : null,
    quantity: 2,
    price: 12800,
    status,
    canReorder: status === 'completed',
    ...overrides,
  };
}

function StoryFrame({ children }: { children: ReactNode }) {
  return <div className="max-w-5xl bg-gray-50 p-4">{children}</div>;
}

export const Default: Story = {
  args: {
    reservation: createReservation('reserved'),
  },
  render: (args) => (
    <StoryFrame>
      <MypageReservationCard {...args} />
    </StoryFrame>
  ),
};

export const AllStatuses: Story = {
  args: {
    reservation: createReservation('reserved'),
  },
  render: () => (
    <StoryFrame>
      <div className="space-y-4">
        {(
          [
            'paymentPending',
            'processing',
            'reserved',
            'accepted',
            'ready',
            'completed',
            'cancelling',
            'cancelled',
            'noShow',
            'expired',
          ] satisfies OrderStatus[]
        ).map((status) => (
          <MypageReservationCard
            key={status}
            reservation={createReservation(status)}
          />
        ))}
      </div>
    </StoryFrame>
  ),
};

export const MobileLongContent: Story = {
  args: {
    reservation: createReservation('ready'),
  },
  render: () => (
    <div className="w-[360px] bg-gray-50 p-4">
      <MypageReservationCard
        reservation={createReservation('ready', {
          storeName: '압구정 아주 긴 이름의 베이커리 카페',
          productName: '저녁 픽업 전용 프리미엄 샌드위치와 디저트 묶음 세트',
          orderNumber: 'PM-20260622-READY-LONG-0001',
        })}
      />
    </div>
  ),
};

export const TabletLongContent: Story = {
  args: {
    reservation: createReservation('ready'),
  },
  render: () => (
    <div className="w-[760px] bg-gray-50 p-4">
      <MypageReservationCard
        reservation={createReservation('ready', {
          storeName: '압구정 아주 긴 이름의 베이커리 카페',
          productName: '저녁 픽업 전용 프리미엄 샌드위치와 디저트 묶음 세트',
          orderNumber: 'PM-20260622-READY-LONG-0001',
        })}
      />
    </div>
  ),
};
