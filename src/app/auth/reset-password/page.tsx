'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getAuthErrorMessage } from '@/lib/errors/authErrorMessage';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useUpdatePassword } from '@/hooks/auth/useUpdatePassword';
import { Button, Input } from '@/components/common';
import Logo from '@/components/common/Logo/Logo';

const resetPasswordSchema = z
  .object({
    password: z.string().min(10, '비밀번호는 10자 이상으로 입력해 주세요.'),
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해 주세요.'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

type ResetPasswordFields = z.infer<typeof resetPasswordSchema>;

const loadingUI = (
  <main className="flex min-h-screen items-center justify-center px-4 py-12">
    <p
      role="status"
      aria-live="polite"
      className="text-sm font-medium text-gray-500"
    >
      세션을 확인하는 중입니다.
    </p>
  </main>
);

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isLoading } = useAuthSession();
  const { mutateAsync: updatePassword } = useUpdatePassword();
  const [isSaved, setIsSaved] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFields>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const [hasRecoveryCode] = useState(() => searchParams.has('code'));

  const isSessionReady = !isLoading && !!session;
  const isExpired = !isLoading && (!session || !hasRecoveryCode);

  useEffect(() => {
    if (isSessionReady && hasRecoveryCode) {
      window.history.replaceState(null, '', '/auth/reset-password');
    }
  }, [isSessionReady, hasRecoveryCode]);

  useEffect(() => {
    if (!isSaved) return;
    if (countdown === 0) {
      router.push('/');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [isSaved, countdown, router]);

  async function onSubmit(data: ResetPasswordFields): Promise<void> {
    try {
      await updatePassword({ password: data.password });
      setIsSaved(true);
    } catch (err) {
      setError('root', { message: getAuthErrorMessage(err) });
    }
  }

  if (isLoading) {
    return loadingUI;
  }

  if (isSaved) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <section className="w-full max-w-sm space-y-6 text-center">
          <Logo size="md" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">비밀번호 변경 완료</h1>
            <p className="text-base font-medium text-gray-600">
              새 비밀번호로 변경되었습니다.
            </p>
            <p
              role="status"
              aria-live="polite"
              className="text-sm font-medium text-gray-400"
            >
              {countdown}초 후 홈으로 이동합니다.
            </p>
          </div>
          <Button
            type="button"
            color="primary"
            className="w-full text-sm"
            onClick={() => router.push('/')}
          >
            지금 홈으로 이동
          </Button>
        </section>
      </main>
    );
  }

  if (isExpired) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <section className="w-full max-w-sm space-y-6">
          <Logo size="md" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">비밀번호 재설정</h1>
            <p role="alert" className="text-base font-medium text-gray-600">
              링크가 만료되었거나 이미 사용되었습니다. 비밀번호 재설정을 다시
              요청해 주세요.
            </p>
          </div>
          <Button
            type="button"
            color="primary"
            className="w-full text-sm"
            onClick={() => router.push('/?auth=required&view=reset')}
          >
            재설정 링크 재요청
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-sm space-y-6">
        <Logo size="md" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">비밀번호 재설정</h1>
          <p className="text-base font-medium text-gray-600">
            새 비밀번호를 입력해 주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="새 비밀번호"
            type={showPassword ? 'text' : 'password'}
            placeholder="10자 이상"
            description="10자 이상으로 설정해 주세요."
            autoComplete="new-password"
            required
            endIcon={
              showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )
            }
            endIconLabel={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            onEndIconClick={() => setShowPassword((v) => !v)}
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="새 비밀번호 확인"
            type={showPasswordConfirm ? 'text' : 'password'}
            placeholder="새 비밀번호 확인"
            autoComplete="new-password"
            required
            endIcon={
              showPasswordConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )
            }
            endIconLabel={
              showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'
            }
            onEndIconClick={() => setShowPasswordConfirm((v) => !v)}
            error={errors.passwordConfirm?.message}
            {...register('passwordConfirm')}
          />
          {errors.root && (
            <p role="alert" className="text-sm text-red-500">
              {errors.root.message}
            </p>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            color="primary"
            className="w-full text-sm"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
        </form>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={loadingUI}>
      <ResetPasswordContent />
    </Suspense>
  );
}
