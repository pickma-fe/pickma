import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProductDetail } from '@/types/product';
import { useCreateOrder } from '@/hooks/orders/useCreateOrder';
import { usePayment } from '@/hooks/payments/usePayment';

import { OrderCheckoutPanel } from './OrderCheckoutPanel';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/hooks/orders/useCreateOrder');
vi.mock('@/hooks/payments/usePayment');

const mockProduct: ProductDetail = {
  id: 'product-1',
  storeId: 'store-1',
  storeName: '테스트 매장',
  menuItemId: 'menu-1',
  name: '테스트 상품',
  originalPrice: 10000,
  discountPrice: 7000,
  discountRate: 30,
  stock: 5,
  reservedStock: 0,
  availableStock: 5,
  endAt: new Date('2026-06-20T00:00:00.000Z'),
  pickupStartTime: '2026-06-20T18:00:00.000Z',
  pickupEndTime: '2026-06-20T20:00:00.000Z',
  status: 'active',
  isSoldOut: false,
  isExpired: false,
  displayStatus: 'available',
  store: {
    id: 'store-1',
    name: '테스트 매장',
    description: '설명',
    phone: '02-1234-5678',
    address: '서울시 중구',
    addressDetail: undefined,
    region: '중구',
    image: undefined,
  },
};

describe('OrderCheckoutPanel', () => {
  beforeEach(() => {
    vi.mocked(useCreateOrder).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateOrder>);
    vi.mocked(usePayment).mockReturnValue({
      openPayment: vi.fn(),
      isPending: false,
      error: null,
    });
  });

  it('픽업 시간을 선택하지 않으면 결제 버튼이 비활성화되고 이유가 aria-describedby로 연결된다', () => {
    render(
      <OrderCheckoutPanel
        product={mockProduct}
        quantity={1}
        finalPaymentPrice={7000}
        initialPickupTime={null}
      />
    );

    const paymentButton = screen.getByRole('button', { name: /결제하기/ });
    expect(paymentButton).toBeDisabled();
    const describedById = paymentButton.getAttribute('aria-describedby');
    expect(describedById).toBe('payment-reason-message');
    expect(document.getElementById(describedById as string)).toHaveTextContent(
      '픽업 시간을 선택해 주세요.'
    );
  });

  it('수량이 0이면 결제 버튼이 비활성화되고 수량 부족 이유가 연결된다', () => {
    render(
      <OrderCheckoutPanel
        product={mockProduct}
        quantity={0}
        finalPaymentPrice={0}
        initialPickupTime={{
          label: '18:00~18:30',
          startAt: '18:00',
          endAt: '18:30',
        }}
      />
    );

    const paymentButton = screen.getByRole('button', { name: /결제하기/ });
    expect(paymentButton).toBeDisabled();
    const describedById = paymentButton.getAttribute('aria-describedby');
    expect(describedById).toBe('payment-reason-message');
    expect(document.getElementById(describedById as string)).toHaveTextContent(
      '결제 가능한 수량이 없습니다.'
    );
  });

  it('픽업 시간이 선택되어 있으면 결제 버튼이 활성화되고 aria-describedby가 없다', () => {
    render(
      <OrderCheckoutPanel
        product={mockProduct}
        quantity={1}
        finalPaymentPrice={7000}
        initialPickupTime={{
          label: '18:00~18:30',
          startAt: '18:00',
          endAt: '18:30',
        }}
      />
    );

    const paymentButton = screen.getByRole('button', { name: /결제하기/ });
    expect(paymentButton).not.toBeDisabled();
    expect(paymentButton).not.toHaveAttribute('aria-describedby');
  });
});
