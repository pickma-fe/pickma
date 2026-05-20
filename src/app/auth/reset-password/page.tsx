'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useUpdatePassword } from '@/hooks/auth/useUpdatePassword';
import { Button, Input } from '@/components/common';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, '비밀번호는 8자 이상으로 입력해 주세요.'),
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해 주세요.'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

type ResetPasswordFields = z.infer<typeof resetPasswordSchema>;

// TODO: 디자인 확정 후 reset password 화면 스타일 교체
export default function ResetPasswordPage() {
  const router = useRouter();
  const { data: session, isLoading, isError } = useAuthSession();
  const { mutateAsync: updatePassword } = useUpdatePassword();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFields>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const isSessionReady = !isLoading && !isError && !!session;

  useEffect(() => {
    if (isError) {
      setError('root', {
        message: '비밀번호를 변경하지 못했습니다. 다시 시도해 주세요.',
      });
    }
  }, [isError, setError]);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (isSessionReady && code) {
      window.history.replaceState(null, '', '/auth/reset-password');
    }
  }, [isSessionReady]);

  async function onSubmit(data: ResetPasswordFields): Promise<void> {
    try {
      await updatePassword({ password: data.password });
      router.push('/');
    } catch {
      setError('root', {
        message: '비밀번호를 변경하지 못했습니다. 다시 시도해 주세요.',
      });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">비밀번호 재설정</h1>
          <p className="text-sm text-gray-600">새 비밀번호를 입력해 주세요.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="새 비밀번호"
            type="password"
            placeholder="8자 이상"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="새 비밀번호 확인"
            type="password"
            placeholder="새 비밀번호 확인"
            error={errors.passwordConfirm?.message}
            {...register('passwordConfirm')}
          />
          {errors.root && (
            <p className="text-sm text-red-500">{errors.root.message}</p>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !isSessionReady}
            color="primary"
            className="w-full text-sm"
          >
            {isSubmitting || !isSessionReady ? '준비 중...' : '저장'}
          </Button>
        </form>
      </section>
    </main>
  );
}
