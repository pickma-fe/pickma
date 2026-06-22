import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCancelSellerApplication } from '@/hooks/seller/applications/useCancelSellerApplication';

import { PendingView } from './PendingView';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('@/hooks/seller/applications/useCancelSellerApplication', () => ({
  useCancelSellerApplication: vi.fn(),
}));

// Headless UI Dialog는 portal로 렌더링되므로 테스트 환경에서 inline 렌더링으로 모킹
vi.mock('@headlessui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@headlessui/react')>();
  return {
    ...actual,
    Dialog: ({
      open,
      children,
    }: {
      open: boolean;
      onClose: () => void;
      children: React.ReactNode;
      className?: string;
    }) => (open ? <div role="dialog">{children}</div> : null),
    DialogPanel: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => <div className={className}>{children}</div>,
    DialogTitle: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => <p className={className}>{children}</p>,
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  }
  Wrapper.displayName = 'TestQueryClientWrapper';

  return Wrapper;
}

function setupCancelMock({
  isPending = false,
  mutate = vi.fn(),
}: {
  isPending?: boolean;
  mutate?: ReturnType<typeof vi.fn>;
} = {}) {
  vi.mocked(useCancelSellerApplication).mockReturnValue({
    mutate,
    isPending,
  } as unknown as ReturnType<typeof useCancelSellerApplication>);
}

describe('PendingView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupCancelMock();
  });

  it('심사 진행 중 메시지를 렌더링한다', () => {
    render(<PendingView />, { wrapper: createWrapper() });

    expect(screen.getByText('심사가 진행 중입니다')).toBeInTheDocument();
  });

  it('초기 상태에서 신청 취소 버튼이 보인다', () => {
    render(<PendingView />, { wrapper: createWrapper() });

    expect(
      screen.getByRole('button', { name: '신청 취소' })
    ).toBeInTheDocument();
  });

  it('신청 취소 버튼 클릭 시 확인 다이얼로그가 표시된다', () => {
    render(<PendingView />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('button', { name: '신청 취소' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('신청을 취소할까요?')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '신청 취소 확정' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '돌아가기' })
    ).toBeInTheDocument();
  });

  it('확인 다이얼로그에서 돌아가기 클릭 시 다이얼로그가 닫힌다', () => {
    render(<PendingView />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('button', { name: '신청 취소' }));
    fireEvent.click(screen.getByRole('button', { name: '돌아가기' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('신청을 취소할까요?')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '신청 취소' })
    ).toBeInTheDocument();
  });

  it('신청 취소 확정 클릭 시 cancelApplication을 호출한다', async () => {
    const mutate = vi.fn();
    setupCancelMock({ mutate });

    render(<PendingView />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('button', { name: '신청 취소' }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '신청 취소 확정' }));
    });

    expect(mutate).toHaveBeenCalledOnce();
  });

  it('취소 진행 중에는 버튼이 비활성화된다', () => {
    setupCancelMock({ isPending: true });

    render(<PendingView />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('button', { name: '신청 취소' }));

    expect(screen.getByRole('button', { name: '취소 중...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '돌아가기' })).toBeDisabled();
  });
});
