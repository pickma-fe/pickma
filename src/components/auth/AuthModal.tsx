'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { authApi } from '@/api/auth/authApi';
import { Button, Input } from '@/components/common';

import { type AuthModalView, useAuthModal } from './useAuthModal';

function getSafeNextPath(next?: string): string {
  if (!next) return '/';
  try {
    const url = new URL(next, window.location.origin);
    if (url.origin !== window.location.origin) return '/';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}

function mapAuthError(error: unknown): string {
  const msg = error instanceof Error ? error.message.toLowerCase() : '';

  if (
    msg.includes('invalid login credentials') ||
    msg.includes('invalid email or password')
  ) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }
  if (
    msg.includes('user already registered') ||
    msg.includes('already been registered')
  ) {
    return '이미 가입된 이메일입니다. 로그인해 주세요.';
  }
  if (msg.includes('email not confirmed')) {
    return '이메일 확인 후 다시 로그인해 주세요.';
  }
  if (
    msg.includes('password should be at least') ||
    msg.includes('weak password')
  ) {
    return '비밀번호는 8자 이상으로 입력해 주세요.';
  }
  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}

const loginSchema = z.object({
  email: z.email('올바른 이메일을 입력해 주세요.'),
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
});
type LoginFields = z.infer<typeof loginSchema>;

const signupSchema = z
  .object({
    name: z.string().min(1, '이름을 입력해 주세요.'),
    email: z.email('올바른 이메일을 입력해 주세요.'),
    password: z.string().min(8, '비밀번호는 8자 이상으로 입력해 주세요.'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });
type SignupFields = z.infer<typeof signupSchema>;

const resetSchema = z.object({
  email: z.email('올바른 이메일을 입력해 주세요.'),
});
type ResetFields = z.infer<typeof resetSchema>;

type OAuthProvider = 'google' | 'kakao';

// TODO: 디자인 확정 후 스타일 교체
// TODO: AuthModal.stories.tsx 작성
export function AuthModal() {
  const { isOpen, view, next, closeAuthModal, changeAuthModalView } =
    useAuthModal();

  return (
    <Dialog open={isOpen} onClose={closeAuthModal} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
        <DialogPanel className="relative max-h-full w-full max-w-sm overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
          <button
            type="button"
            aria-label="닫기"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 rounded-sm p-1 text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none"
          >
            <XIcon className="h-5 w-5" />
          </button>
          {view === 'login' && (
            <LoginForm
              next={next}
              onClose={closeAuthModal}
              onChangeView={changeAuthModalView}
            />
          )}
          {view === 'signup' && (
            <SignupForm
              next={next}
              onClose={closeAuthModal}
              onChangeView={changeAuthModalView}
            />
          )}
          {view === 'reset' && <ResetForm onChangeView={changeAuthModalView} />}
        </DialogPanel>
      </div>
    </Dialog>
  );
}

interface LoginFormProps {
  next?: string;
  onClose: () => void;
  onChangeView: (view: AuthModalView) => void;
}

function LoginForm({ next, onClose, onChangeView }: LoginFormProps) {
  const router = useRouter();
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(
    null
  );
  const {
    register,
    handleSubmit: handleSubmitRH,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({ resolver: zodResolver(loginSchema) });

  async function handleSubmit(data: LoginFields) {
    try {
      const result = await authApi.signInWithEmail(data);
      if (result.session) {
        onClose();
        router.push(getSafeNextPath(next));
      }
    } catch (err) {
      setError('root', { message: mapAuthError(err) });
    }
  }

  async function handleOAuthLogin(provider: OAuthProvider) {
    setPendingProvider(provider);
    try {
      if (provider === 'google') {
        await authApi.signInWithGoogle(next);
      } else {
        await authApi.signInWithKakao(next);
      }
    } catch (err) {
      setPendingProvider(null);
      setError('root', { message: mapAuthError(err) });
    }
  }

  return (
    <div className="space-y-4">
      <DialogTitle className="text-lg font-semibold">로그인</DialogTitle>
      <form onSubmit={handleSubmitRH(handleSubmit)} className="space-y-3">
        <Input
          label="이메일"
          type="email"
          placeholder="이메일"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="비밀번호"
          type="password"
          placeholder="비밀번호"
          error={errors.password?.message}
          {...register('password')}
        />
        {errors.root && (
          <p className="text-sm text-red-500">{errors.root.message}</p>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          color="primary"
          className="w-full text-sm"
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </Button>
      </form>
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          color="gray"
          disabled={isSubmitting || pendingProvider !== null}
          onClick={() => handleOAuthLogin('google')}
          className="w-full text-sm"
        >
          Google로 계속하기
        </Button>
        <button
          type="button"
          disabled={isSubmitting || pendingProvider !== null}
          onClick={() => handleOAuthLogin('kakao')}
          className="w-full rounded-sm bg-yellow-300 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-200"
        >
          카카오로 계속하기
        </button>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <Button
          type="button"
          variant="ghost"
          color="gray"
          onClick={() => onChangeView('signup')}
          className="text-xs"
        >
          회원가입
        </Button>
        <Button
          type="button"
          variant="ghost"
          color="gray"
          onClick={() => onChangeView('reset')}
          className="text-xs"
        >
          비밀번호 재설정
        </Button>
      </div>
    </div>
  );
}

interface SignupFormProps {
  next?: string;
  onClose: () => void;
  onChangeView: (view: AuthModalView) => void;
}

function SignupForm({ next, onClose, onChangeView }: SignupFormProps) {
  const router = useRouter();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const {
    register,
    handleSubmit: handleSubmitRH,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFields>({ resolver: zodResolver(signupSchema) });

  async function handleSubmit(data: SignupFields) {
    try {
      const result = await authApi.signUpWithEmail({
        email: data.email,
        password: data.password,
        name: data.name,
        redirectPath: next,
      });
      if (result.session) {
        onClose();
        router.push(getSafeNextPath(next));
      } else {
        setSentEmail(data.email);
        setIsEmailSent(true);
      }
    } catch (err) {
      setError('root', { message: mapAuthError(err) });
    }
  }

  if (isEmailSent) {
    return (
      <div className="space-y-4">
        <DialogTitle className="text-lg font-semibold">이메일 확인</DialogTitle>
        <p className="text-sm text-gray-600">
          {sentEmail}로 확인 메일을 발송했습니다. 메일을 확인해 가입을 완료해
          주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DialogTitle className="text-lg font-semibold">회원가입</DialogTitle>
      <form onSubmit={handleSubmitRH(handleSubmit)} className="space-y-3">
        <Input
          label="이름"
          type="text"
          placeholder="이름"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="이메일"
          type="email"
          placeholder="이메일"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="비밀번호"
          type="password"
          placeholder="비밀번호 (8자 이상)"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호 확인"
          error={errors.passwordConfirm?.message}
          {...register('passwordConfirm')}
        />
        {errors.root && (
          <p className="text-sm text-red-500">{errors.root.message}</p>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          color="primary"
          className="w-full text-sm"
        >
          {isSubmitting ? '가입 중...' : '회원가입'}
        </Button>
      </form>
      <Button
        type="button"
        variant="ghost"
        color="gray"
        onClick={() => onChangeView('login')}
        className="w-full text-xs"
      >
        이미 계정이 있으신가요? 로그인
      </Button>
    </div>
  );
}

interface ResetFormProps {
  onChangeView: (view: AuthModalView) => void;
}

function ResetForm({ onChangeView }: ResetFormProps) {
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const {
    register,
    handleSubmit: handleSubmitRH,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetFields>({ resolver: zodResolver(resetSchema) });

  async function handleSubmit(data: ResetFields) {
    try {
      await authApi.resetPasswordForEmail({ email: data.email });
      setSentEmail(data.email);
      setIsSent(true);
    } catch (err) {
      setError('root', { message: mapAuthError(err) });
    }
  }

  if (isSent) {
    return (
      <div className="space-y-4">
        <DialogTitle className="text-lg font-semibold">
          비밀번호 재설정
        </DialogTitle>
        <p className="text-sm text-gray-600">
          {sentEmail}로 비밀번호 재설정 링크를 발송했습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DialogTitle className="text-lg font-semibold">
        비밀번호 재설정
      </DialogTitle>
      <form onSubmit={handleSubmitRH(handleSubmit)} className="space-y-3">
        <Input
          label="이메일"
          type="email"
          placeholder="가입한 이메일"
          error={errors.email?.message}
          {...register('email')}
        />
        {errors.root && (
          <p className="text-sm text-red-500">{errors.root.message}</p>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          color="primary"
          className="w-full text-sm"
        >
          {isSubmitting ? '발송 중...' : '재설정 링크 발송'}
        </Button>
      </form>
      <Button
        type="button"
        variant="ghost"
        color="gray"
        onClick={() => onChangeView('login')}
        className="w-full text-xs"
      >
        로그인으로 돌아가기
      </Button>
    </div>
  );
}
