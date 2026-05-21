import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paymentApi } from '@/api/payments/paymentApi';

vi.mock('@/api/payments/paymentApi', () => ({
  paymentApi: {
    preparePayment: vi.fn(),
  },
}));

const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined);
const mockRouterPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

const mockPrepareResult = {
  redirectUrl:
    '/payment/success?paymentKey=mock_pk_test&orderId=PM2026TEST&amount=5000',
  orderNumber: 'PM2026TEST',
  amount: 5000,
};

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function TestWrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  }
  return TestWrapper;
}

function makePopup(overrides: Partial<{ closed: boolean }> = {}) {
  return { closed: false, close: vi.fn(), ...overrides } as unknown as Window;
}

import { usePayment } from './usePayment';

describe('usePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(paymentApi.preparePayment).mockResolvedValue(mockPrepareResult);
  });

  it('prepare 성공 시 window.open(redirectUrl) 호출', async () => {
    const popup = makePopup();
    vi.stubGlobal('open', vi.fn().mockReturnValue(popup));

    const { result } = renderHook(() => usePayment(), {
      wrapper: createWrapper(),
    });

    const promise = result.current.openPayment({
      orderNumber: 'PM2026TEST',
      orderName: '크루아상 2개',
    });

    await waitFor(() => expect(window.open).toHaveBeenCalled());

    expect(window.open).toHaveBeenCalledWith(
      mockPrepareResult.redirectUrl,
      '_blank',
      expect.stringContaining('width=')
    );

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: popup,
          data: { success: true, orderNumber: 'PM2026TEST' },
        })
      );
    });

    await expect(promise).resolves.toEqual({ orderNumber: 'PM2026TEST' });
    expect(mockRouterPush).toHaveBeenCalledWith(
      '/order/complete?orderNumber=PM2026TEST'
    );
  });

  it('window.open 반환값이 null → 팝업 차단 에러 reject', async () => {
    vi.stubGlobal('open', vi.fn().mockReturnValue(null));

    const { result } = renderHook(() => usePayment(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.openPayment({
        orderNumber: 'PM2026TEST',
        orderName: '크루아상 2개',
      })
    ).rejects.toThrow('팝업이 차단되었습니다');
  });

  it('success:true → resolve 후 orders query invalidate', async () => {
    const popup = makePopup();
    vi.stubGlobal('open', vi.fn().mockReturnValue(popup));
    const { result } = renderHook(() => usePayment(), {
      wrapper: createWrapper(),
    });

    const promise = result.current.openPayment({
      orderNumber: 'PM2026TEST',
      orderName: '크루아상 2개',
    });

    await waitFor(() => expect(window.open).toHaveBeenCalled());

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: popup,
          data: { success: true, orderNumber: 'PM2026TEST' },
        })
      );
    });

    await expect(promise).resolves.toEqual({ orderNumber: 'PM2026TEST' });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['orders', 'list'],
    });
    expect(mockRouterPush).toHaveBeenCalledWith(
      '/order/complete?orderNumber=PM2026TEST'
    );
  });

  it('success:false 메시지 수신 시 reject', async () => {
    const popup = makePopup();
    vi.stubGlobal('open', vi.fn().mockReturnValue(popup));
    const { result } = renderHook(() => usePayment(), {
      wrapper: createWrapper(),
    });

    const promise = result.current.openPayment({
      orderNumber: 'PM2026TEST',
      orderName: '크루아상 2개',
    });

    await waitFor(() => expect(window.open).toHaveBeenCalled());

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: popup,
          data: { success: false },
        })
      );
    });

    await expect(promise).rejects.toThrow('payment_failed');
    expect(mockRouterPush).toHaveBeenCalledWith(
      '/order/fail?reason=payment_failed'
    );
  });

  it('success:true 메시지에 orderNumber가 없으면 payment_failed reject', async () => {
    const popup = makePopup();
    vi.stubGlobal('open', vi.fn().mockReturnValue(popup));
    const { result } = renderHook(() => usePayment(), {
      wrapper: createWrapper(),
    });

    const promise = result.current.openPayment({
      orderNumber: 'PM2026TEST',
      orderName: '크루아상 2개',
    });

    await waitFor(() => expect(window.open).toHaveBeenCalled());

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: popup,
          data: { success: true },
        })
      );
    });

    await expect(promise).rejects.toThrow('payment_failed');
    expect(mockRouterPush).toHaveBeenCalledWith(
      '/order/fail?reason=payment_failed'
    );
  });

  it('success:true 메시지의 orderNumber가 요청값과 다르면 payment_failed reject', async () => {
    const popup = makePopup();
    vi.stubGlobal('open', vi.fn().mockReturnValue(popup));
    const { result } = renderHook(() => usePayment(), {
      wrapper: createWrapper(),
    });

    const promise = result.current.openPayment({
      orderNumber: 'PM2026TEST',
      orderName: '크루아상 2개',
    });

    await waitFor(() => expect(window.open).toHaveBeenCalled());

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: popup,
          data: { success: true, orderNumber: 'PM2026OTHER' },
        })
      );
    });

    await expect(promise).rejects.toThrow('payment_failed');
    expect(mockRouterPush).toHaveBeenCalledWith(
      '/order/fail?reason=payment_failed'
    );
  });

  it('다른 origin 메시지는 무시 → 이후 정상 메시지 처리', async () => {
    const popup = makePopup();
    vi.stubGlobal('open', vi.fn().mockReturnValue(popup));
    const { result } = renderHook(() => usePayment(), {
      wrapper: createWrapper(),
    });

    const promise = result.current.openPayment({
      orderNumber: 'PM2026TEST',
      orderName: '크루아상 2개',
    });

    await waitFor(() => expect(window.open).toHaveBeenCalled());

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://evil.com',
          source: popup,
          data: { success: true, orderNumber: 'PM2026TEST' },
        })
      );
    });

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: popup,
          data: { success: false },
        })
      );
    });

    await expect(promise).rejects.toThrow('payment_failed');
  });

  it('popup.closed가 true가 되면 payment_cancelled reject', async () => {
    const popup = makePopup({ closed: false });
    vi.stubGlobal('open', vi.fn().mockReturnValue(popup));
    const { result } = renderHook(() => usePayment(), {
      wrapper: createWrapper(),
    });

    const promise = result.current.openPayment({
      orderNumber: 'PM2026TEST',
      orderName: '크루아상 2개',
    });

    await waitFor(() => expect(window.open).toHaveBeenCalled());

    (popup as unknown as { closed: boolean }).closed = true;

    await expect(promise).rejects.toThrow('payment_cancelled');
    expect(mockRouterPush).toHaveBeenCalledWith(
      '/order/fail?reason=payment_cancelled'
    );
  }, 3000);
});
