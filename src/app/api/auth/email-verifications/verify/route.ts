import type { NextRequest } from 'next/server';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
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

export function GET(): Response {
  return fail(ERROR_CODE.NOT_IMPLEMENTED, 501);
}
