'use client';

import { Checkbox, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { getAuthErrorMessage } from '@/lib/errors/authErrorMessage';
import { useCompleteEmailSignup } from '@/hooks/auth/useCompleteEmailSignup';
import { useEmailLogin } from '@/hooks/auth/useEmailLogin';
import { useOAuthLogin } from '@/hooks/auth/useOAuthLogin';
import { useRequestEmailVerification } from '@/hooks/auth/useRequestEmailVerification';
import { useResetPassword } from '@/hooks/auth/useResetPassword';
import { useVerifyEmailOtp } from '@/hooks/auth/useVerifyEmailOtp';
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

const trimmedEmail = z
  .string()
  .trim()
  .pipe(z.email('올바른 이메일을 입력해 주세요.'));

const loginSchema = z.object({
  email: trimmedEmail,
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
});
type LoginFields = z.infer<typeof loginSchema>;

const signupSchema = z
  .object({
    name: z.string().trim().min(1, '이름을 입력해 주세요.'),
    email: trimmedEmail,
    password: z.string().min(8, '비밀번호는 8자 이상으로 입력해 주세요.'),
    passwordConfirm: z.string(),
    termsAgreed: z
      .boolean()
      .refine((value) => value, '이용약관에 동의해 주세요.'),
    privacyAgreed: z
      .boolean()
      .refine((value) => value, '개인정보 수집·이용에 동의해 주세요.'),
    marketingAgreed: z.boolean(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });
type SignupFields = z.infer<typeof signupSchema>;

const resetSchema = z.object({
  email: trimmedEmail,
});
type ResetFields = z.infer<typeof resetSchema>;

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
  const { mutateAsync: emailLogin } = useEmailLogin();
  const {
    signInWithOAuth,
    pendingProvider,
    error: oauthError,
  } = useOAuthLogin();
  const {
    register,
    handleSubmit: handleSubmitRH,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (oauthError) {
      setError('root', { message: getAuthErrorMessage(oauthError) });
    }
  }, [oauthError, setError]);

  async function handleSubmit(data: LoginFields) {
    try {
      const result = await emailLogin(data);
      if (result.session) {
        onClose();
        router.push(getSafeNextPath(next));
      }
    } catch (err) {
      setError('root', { message: getAuthErrorMessage(err) });
    }
  }

  function handleOAuthLogin(provider: 'google' | 'kakao') {
    signInWithOAuth(provider, next);
  }

  const isOAuthPending = pendingProvider !== null;

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
          disabled={isSubmitting || isOAuthPending}
          onClick={() => handleOAuthLogin('google')}
          className="w-full text-sm"
        >
          Google로 계속하기
        </Button>
        <button
          type="button"
          disabled={isSubmitting || isOAuthPending}
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
  const { mutateAsync: completeSignup } = useCompleteEmailSignup();
  const { mutateAsync: requestVerification, isPending: isRequestingOtp } =
    useRequestEmailVerification();
  const { mutateAsync: verifyOtp, isPending: isVerifyingOtp } =
    useVerifyEmailOtp();
  const [verificationState, setVerificationState] = useState<
    'idle' | 'otp-sent' | 'verified'
  >('idle');
  const [verificationToken, setVerificationToken] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const {
    register,
    handleSubmit: handleSubmitRH,
    setError,
    trigger,
    getValues,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFields>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      termsAgreed: false,
      privacyAgreed: false,
      marketingAgreed: false,
    },
  });

  const termsAgreed = useWatch({ control, name: 'termsAgreed' });
  const privacyAgreed = useWatch({ control, name: 'privacyAgreed' });
  const marketingAgreed = useWatch({ control, name: 'marketingAgreed' });
  const allTermsAgreed = Boolean(
    termsAgreed && privacyAgreed && marketingAgreed
  );
  const allRequiredTermsAgreed = Boolean(termsAgreed && privacyAgreed);

  function handleEmailChange() {
    setVerificationState('idle');
    setVerificationToken('');
    setOtp('');
    setOtpError('');
  }

  async function handleRequestVerification() {
    const requestedEmail = getValues('email').trim();
    const valid = await trigger('email');
    if (!valid) return;
    try {
      setOtp('');
      setOtpError('');
      await requestVerification({ email: requestedEmail });
      if (getValues('email').trim() !== requestedEmail) return;
      setVerificationState('otp-sent');
    } catch (err) {
      setError('email', { message: getAuthErrorMessage(err) });
    }
  }

  async function handleVerifyOtp() {
    const requestedEmail = getValues('email').trim();
    try {
      setOtpError('');
      const result = await verifyOtp({ email: requestedEmail, otp });
      if (getValues('email').trim() !== requestedEmail) return;
      setVerificationToken(result.verificationToken);
      setVerificationState('verified');
      setOtp('');
    } catch (err) {
      setOtpError(getAuthErrorMessage(err));
    }
  }

  async function handleSubmit(data: SignupFields) {
    if (!verificationToken) return;
    try {
      const result = await completeSignup({
        email: data.email,
        verificationToken,
        password: data.password,
        name: data.name,
      });
      if (result.session) {
        onClose();
        router.push(getSafeNextPath(next));
      }
    } catch (err) {
      setError('root', { message: getAuthErrorMessage(err) });
    }
  }

  function handleAllTermsChange(checked: boolean) {
    setValue('termsAgreed', checked, { shouldValidate: true });
    setValue('privacyAgreed', checked, { shouldValidate: true });
    setValue('marketingAgreed', checked, { shouldValidate: true });
  }

  function handleTermChange(
    field: 'termsAgreed' | 'privacyAgreed' | 'marketingAgreed',
    checked: boolean
  ) {
    setValue(field, checked, { shouldDirty: true, shouldValidate: true });
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
        <div className="space-y-1">
          <Input
            label="이메일"
            type="email"
            placeholder="이메일"
            error={errors.email?.message}
            disabled={verificationState === 'verified'}
            {...register('email', { onChange: handleEmailChange })}
          />
          {verificationState === 'idle' && (
            <Button
              type="button"
              variant="outline"
              color="gray"
              disabled={isRequestingOtp}
              onClick={handleRequestVerification}
              className="w-full text-sm"
            >
              {isRequestingOtp ? '발송 중...' : '이메일 인증하기'}
            </Button>
          )}
          {verificationState === 'otp-sent' && (
            <div className="space-y-1">
              <Input
                label="인증 코드"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6자리 숫자"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                error={otpError}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  disabled={isVerifyingOtp || otp.length !== 6}
                  onClick={handleVerifyOtp}
                  color="primary"
                  className="flex-1 text-sm"
                >
                  {isVerifyingOtp ? '확인 중...' : '인증 확인'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  color="gray"
                  disabled={isRequestingOtp}
                  onClick={handleRequestVerification}
                  className="flex-1 text-sm"
                >
                  재전송
                </Button>
              </div>
            </div>
          )}
          {verificationState === 'verified' && (
            <p className="text-sm text-green-600">✓ 이메일 인증 완료</p>
          )}
        </div>
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
        <div className="space-y-2 rounded-md border border-gray-200 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Checkbox
              checked={allTermsAgreed}
              onChange={handleAllTermsChange}
              aria-label="회원가입 약관 전체 동의"
              className="data-checked:bg-primary-500 data-checked:border-primary-500 focus-visible:ring-primary-500 flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
            >
              {allTermsAgreed && <CheckIcon className="h-3 w-3 text-white" />}
            </Checkbox>
            <span>전체 동의</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <Checkbox
              checked={Boolean(termsAgreed)}
              onChange={(checked) => handleTermChange('termsAgreed', checked)}
              aria-label="이용약관 동의"
              className="data-checked:bg-primary-500 data-checked:border-primary-500 focus-visible:ring-primary-500 mt-0.5 flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
            >
              {Boolean(termsAgreed) && (
                <CheckIcon className="h-3 w-3 text-white" />
              )}
            </Checkbox>
            <span>
              <Link
                href="/terms"
                target="_blank"
                className="font-medium underline underline-offset-2"
              >
                이용약관
              </Link>
              에 동의합니다. <span className="text-red-500">(필수)</span>
            </span>
          </div>
          {errors.termsAgreed && (
            <p className="pl-6 text-xs text-red-500">
              {errors.termsAgreed.message}
            </p>
          )}
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <Checkbox
              checked={Boolean(privacyAgreed)}
              onChange={(checked) => handleTermChange('privacyAgreed', checked)}
              aria-label="개인정보 수집·이용 동의"
              className="data-checked:bg-primary-500 data-checked:border-primary-500 focus-visible:ring-primary-500 mt-0.5 flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
            >
              {Boolean(privacyAgreed) && (
                <CheckIcon className="h-3 w-3 text-white" />
              )}
            </Checkbox>
            <span>
              <Link
                href="/privacy-policy"
                target="_blank"
                className="font-medium underline underline-offset-2"
              >
                개인정보 수집·이용
              </Link>
              에 동의합니다. <span className="text-red-500">(필수)</span>
            </span>
          </div>
          {errors.privacyAgreed && (
            <p className="pl-6 text-xs text-red-500">
              {errors.privacyAgreed.message}
            </p>
          )}
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <Checkbox
              checked={Boolean(marketingAgreed)}
              onChange={(checked) =>
                handleTermChange('marketingAgreed', checked)
              }
              aria-label="마케팅 정보 수신 동의"
              className="data-checked:bg-primary-500 data-checked:border-primary-500 focus-visible:ring-primary-500 mt-0.5 flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
            >
              {Boolean(marketingAgreed) && (
                <CheckIcon className="h-3 w-3 text-white" />
              )}
            </Checkbox>
            <span>마케팅 정보 수신에 동의합니다. (선택)</span>
          </div>
        </div>
        {errors.root && (
          <p className="text-sm text-red-500">{errors.root.message}</p>
        )}
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            verificationState !== 'verified' ||
            !allRequiredTermsAgreed
          }
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
  const { mutateAsync: resetPassword } = useResetPassword();
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
      await resetPassword({ email: data.email });
      setSentEmail(data.email);
      setIsSent(true);
    } catch (err) {
      setError('root', { message: getAuthErrorMessage(err) });
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
