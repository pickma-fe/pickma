import type { AuthResult, AuthSession } from '@/types/auth';
import type {
  CompleteEmailSignupRequest,
  RequestEmailVerificationRequest,
  RequestEmailVerificationResponse,
  ResetPasswordRequest,
  SignInWithEmailRequest,
  SignUpWithEmailRequest,
  UpdatePasswordRequest,
  VerifyEmailOtpRequest,
  VerifyEmailOtpResponse,
} from '@/contracts/auth';
import { createClient } from '@/lib/supabase/client';

import { apiClient } from '../apiClient';
import { mapAuthResult, mapAuthSession } from './authMapper';

function buildRedirectTo(redirectPath?: string): string {
  const rawPath =
    redirectPath ??
    new URLSearchParams(window.location.search).get('next') ??
    '/';
  const redirectUrl = new URL(rawPath, window.location.origin);

  if (redirectUrl.origin !== window.location.origin) {
    return new URL('/', window.location.origin).toString();
  }

  return redirectUrl.toString();
}

export const authApi = {
  signInWithGoogle(redirectPath?: string): Promise<void> {
    const supabase = createClient();
    return supabase.auth
      .signInWithOAuth({
        provider: 'google',
        options: { redirectTo: buildRedirectTo(redirectPath) },
      })
      .then(({ error }) => {
        if (error) throw error;
      });
  },

  signInWithKakao(redirectPath?: string): Promise<void> {
    const supabase = createClient();
    return supabase.auth
      .signInWithOAuth({
        provider: 'kakao',
        options: { redirectTo: buildRedirectTo(redirectPath) },
      })
      .then(({ error }) => {
        if (error) throw error;
      });
  },

  signUpWithEmail({
    email,
    password,
    name,
    redirectPath,
  }: SignUpWithEmailRequest): Promise<AuthResult> {
    const supabase = createClient();
    return supabase.auth
      .signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: buildRedirectTo(redirectPath),
        },
      })
      .then(({ data, error }) => {
        if (error) throw error;
        return mapAuthResult(data.user, data.session);
      });
  },

  signInWithEmail({
    email,
    password,
  }: SignInWithEmailRequest): Promise<AuthResult> {
    const supabase = createClient();
    return supabase.auth
      .signInWithPassword({ email, password })
      .then(({ data, error }) => {
        if (error) throw error;
        return mapAuthResult(data.user, data.session);
      });
  },

  resetPasswordForEmail({
    email,
    redirectPath,
  }: ResetPasswordRequest): Promise<void> {
    const supabase = createClient();
    return supabase.auth
      .resetPasswordForEmail(email, {
        redirectTo: buildRedirectTo(redirectPath ?? '/auth/reset-password'),
      })
      .then(({ error }) => {
        if (error) throw error;
      });
  },

  updatePassword({ password }: UpdatePasswordRequest): Promise<AuthResult> {
    const supabase = createClient();
    return supabase.auth.updateUser({ password }).then(({ data, error }) => {
      if (error) throw error;
      return mapAuthResult(data.user, null);
    });
  },

  requestEmailVerification(
    req: RequestEmailVerificationRequest
  ): Promise<RequestEmailVerificationResponse> {
    return apiClient.post<RequestEmailVerificationResponse>(
      '/api/auth/email-verifications/request',
      req
    );
  },

  verifyEmailOtp(req: VerifyEmailOtpRequest): Promise<VerifyEmailOtpResponse> {
    return apiClient.post<VerifyEmailOtpResponse>(
      '/api/auth/email-verifications/verify',
      req
    );
  },

  async completeEmailSignup(
    req: CompleteEmailSignupRequest
  ): Promise<AuthResult> {
    await apiClient.post<null>('/api/auth/email-signup', req);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: req.email,
      password: req.password,
    });
    if (error) throw error;
    return mapAuthResult(data.user, data.session);
  },

  signOut(): Promise<void> {
    const supabase = createClient();
    return supabase.auth.signOut().then(({ error }) => {
      if (error) throw error;
    });
  },

  getSession(): Promise<AuthSession | undefined> {
    const supabase = createClient();
    return supabase.auth.getSession().then(({ data, error }) => {
      if (error) throw error;
      return mapAuthSession(data.session);
    });
  },
};
