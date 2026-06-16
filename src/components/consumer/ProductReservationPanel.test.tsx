import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProductReservationPanel } from './ProductReservationPanel';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('ProductReservationPanel', () => {
  it('픽업 시간을 선택하지 않으면 담기 버튼이 비활성화되고 이유가 aria-describedby로 연결된다', () => {
    render(
      <ProductReservationPanel
        productId="product-1"
        price={1000}
        availableStock={5}
        pickupStartTime="18:00"
        pickupEndTime="20:00"
      />
    );

    const addButton = screen.getByRole('button', { name: /담기/ });
    expect(addButton).toBeDisabled();
    const describedById = addButton.getAttribute('aria-describedby');
    expect(describedById).toBe('add-disabled-reason');
    expect(document.getElementById(describedById as string)).toHaveTextContent(
      '픽업 시간을 선택해 주세요.'
    );
  });

  it('재고가 없으면 담기 버튼이 비활성화되고 재고 없음 이유가 연결된다', () => {
    render(
      <ProductReservationPanel
        productId="product-1"
        price={1000}
        availableStock={0}
        pickupStartTime="18:00"
        pickupEndTime="20:00"
      />
    );

    const addButton = screen.getByRole('button', { name: '예약 불가' });
    expect(addButton).toBeDisabled();
    const describedById = addButton.getAttribute('aria-describedby');
    expect(describedById).toBe('add-disabled-reason');
    expect(document.getElementById(describedById as string)).toHaveTextContent(
      '재고가 없어 예약할 수 없습니다.'
    );
  });
});
