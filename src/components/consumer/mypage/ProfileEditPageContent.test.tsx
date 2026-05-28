import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { User } from '@/types/user';
import { useSignOut } from '@/hooks/auth/useSignOut';
import { useDeleteMe } from '@/hooks/users/useDeleteMe';
import { useMe } from '@/hooks/users/useMe';
import { useUpdateMe } from '@/hooks/users/useUpdateMe';

import { ProfileEditPageContent } from './ProfileEditPageContent';

const { mockDeleteMe, mockPush, mockSignOut, mockUpdateMe } = vi.hoisted(
  () => ({
    mockPush: vi.fn(),
    mockDeleteMe: vi.fn(),
    mockSignOut: vi.fn(),
    mockUpdateMe: vi.fn(),
  })
);

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/hooks/users/useMe');
vi.mock('@/hooks/users/useUpdateMe');
vi.mock('@/hooks/users/useDeleteMe');
vi.mock('@/hooks/auth/useSignOut');

const mockUser: User = {
  id: 'user-1',
  email: 'customer@example.com',
  name: '픽마 고객',
  phone: '010-1234-5678',
  authProvider: 'kakao',
  role: 'customer',
  status: 'active',
  createdAt: new Date('2026-05-01T00:00:00.000Z'),
  updatedAt: new Date('2026-05-01T00:00:00.000Z'),
};

describe('ProfileEditPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMe).mockReturnValue({
      data: mockUser,
      isError: false,
      isLoading: false,
    } as ReturnType<typeof useMe>);
    vi.mocked(useUpdateMe).mockReturnValue({
      mutate: mockUpdateMe,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateMe>);
    vi.mocked(useDeleteMe).mockReturnValue({
      mutateAsync: mockDeleteMe,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteMe>);
    vi.mocked(useSignOut).mockReturnValue({
      mutateAsync: mockSignOut,
      isPending: false,
    } as unknown as ReturnType<typeof useSignOut>);
  });

  it('내 정보 값을 입력값으로 표시한다', () => {
    render(<ProfileEditPageContent />);

    expect(
      screen.getByRole('heading', { name: '내 정보' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '계정 정보' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('로그인 계정 정보를 확인할 수 있습니다.')
    ).toBeInTheDocument();
    expect(screen.getByText('customer@example.com')).toBeInTheDocument();
    expect(screen.getByText('카카오 계정으로 로그인')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '계정 연결 관리' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '로그아웃' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('닉네임')).toHaveValue('픽마 고객');
    expect(screen.getByLabelText('연락처')).toHaveValue('010-1234-5678');
    expect(
      screen.getByRole('heading', { name: '계정 관리' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '도움이 필요하신가요?' })
    ).toBeInTheDocument();
  });

  it('authProvider가 없으면 로그인 provider를 단정하지 않는다', () => {
    vi.mocked(useMe).mockReturnValue({
      data: { ...mockUser, authProvider: undefined },
      isError: false,
      isLoading: false,
    } as ReturnType<typeof useMe>);

    render(<ProfileEditPageContent />);

    expect(
      screen.queryByText('카카오 계정으로 로그인')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        '이메일과 로그인 정보는 인증 계정 설정에서 관리됩니다.'
      )
    ).not.toBeInTheDocument();
  });

  it('저장 시 trim된 닉네임과 연락처를 업데이트하고 현재 페이지에 머문다', async () => {
    mockUpdateMe.mockImplementation((_data, options) => {
      options.onSuccess();
    });
    render(<ProfileEditPageContent />);

    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: ' 새 이름 ' },
    });
    fireEvent.change(screen.getByLabelText('연락처'), {
      target: { value: ' 010-9999-0000 ' },
    });
    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));

    await waitFor(() => {
      expect(mockUpdateMe).toHaveBeenCalledWith(
        { name: '새 이름', phone: '010-9999-0000' },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      );
    });
    expect(mockPush).not.toHaveBeenCalledWith('/mypage');
    expect(
      screen.getByText('프로필 정보가 저장되었습니다.')
    ).toBeInTheDocument();
  });

  it('회원 탈퇴 확인 후 deleteMe와 signOut을 실행하고 홈으로 이동한다', async () => {
    mockDeleteMe.mockResolvedValue(undefined);
    mockSignOut.mockResolvedValue(undefined);
    render(<ProfileEditPageContent />);

    fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));
    expect(
      screen.getByRole('dialog', { name: '회원 탈퇴' })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '탈퇴하기' }));

    await waitFor(() => {
      expect(mockDeleteMe).toHaveBeenCalledOnce();
    });
    expect(mockSignOut).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
