import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { hashValue } from './email-verification-keys';
import { getEmailVerificationStore } from './upstash-email-verification-store';

export async function completeEmailSignup(
  email: string,
  verificationToken: string,
  password: string,
  name: string
): Promise<void> {
  const store = getEmailVerificationStore();
  const emailHash = hashValue(email);
  const tokenHash = hashValue(verificationToken);

  let beginResult;
  try {
    beginResult = await store.beginSignupWithVerificationToken(
      tokenHash,
      emailHash
    );
  } catch {
    throw new AppError(ERROR_CODE.AUTH_EMAIL_STORE_UNAVAILABLE, 503);
  }

  if (!beginResult.ok) {
    if (beginResult.alreadyInProgress) {
      throw new AppError(
        ERROR_CODE.AUTH_EMAIL_SIGNUP_IN_PROGRESS,
        409,
        undefined,
        [
          {
            path: 'retryAfterSeconds',
            message: String(beginResult.retryAfterSeconds ?? 0),
          },
        ]
      );
    }
    throw new AppError(ERROR_CODE.AUTH_EMAIL_VERIFICATION_TOKEN_INVALID, 400);
  }

  const supabase = createServiceRoleClient();

  const { data: authData, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

  if (createError) {
    if (createError.status === 422) {
      await store
        .completeSignupWithVerificationToken(tokenHash)
        .catch(() => {});
      throw new AppError(ERROR_CODE.AUTH_EMAIL_ALREADY_EXISTS, 409);
    }
    await store.releaseSignupVerificationToken(tokenHash).catch(() => {});
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const authUserId = authData.user.id;

  const { error: insertError } = await supabase
    .from('users')
    .insert({ id: authUserId, email, name });

  if (insertError) {
    const { error: deleteError } =
      await supabase.auth.admin.deleteUser(authUserId);
    if (!deleteError) {
      await store.releaseSignupVerificationToken(tokenHash).catch(() => {});
    } else {
      await store
        .completeSignupWithVerificationToken(tokenHash)
        .catch(() => {});
    }
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  await store.completeSignupWithVerificationToken(tokenHash).catch(() => {});
}
