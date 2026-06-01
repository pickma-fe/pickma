import type { NextRequest } from 'next/server';

import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';

import { verifyEmailOtp } from '../../_lib/email-verification-service';
import { verifyEmailOtpSchema } from '../../_lib/schemas';

export async function POST(request: NextRequest): Promise<Response> {
  if (isApiMockEnabled()) {
    return success({
      verificationToken: 'mock-verification-token',
      expiresAt: new Date(Date.now() + 1_800_000).toISOString(),
    });
  }

  try {
    const { email, otp } = await validateBody(verifyEmailOtpSchema, request);
    const { verificationToken, expiresAt } = await verifyEmailOtp(email, otp);
    return success({ verificationToken, expiresAt: expiresAt.toISOString() });
  } catch (e) {
    return routeError(e);
  }
}
