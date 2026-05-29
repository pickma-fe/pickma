import type { NextRequest } from 'next/server';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';

import { requestEmailVerification } from '../../_lib/email-verification-service';
import { getRequestIp } from '../../_lib/request-ip';
import { requestEmailVerificationSchema } from '../../_lib/schemas';

export async function POST(request: NextRequest): Promise<Response> {
  if (isApiMockEnabled()) {
    return success({
      challengeId: 'mock-challenge-id',
      expiresAt: new Date(Date.now() + 600_000).toISOString(),
    });
  }

  try {
    const { email } = await validateBody(
      requestEmailVerificationSchema,
      request
    );
    const ip = getRequestIp(request);
    const { challengeId, expiresAt } = await requestEmailVerification(
      email,
      ip
    );
    return success({ challengeId, expiresAt: expiresAt.toISOString() });
  } catch (e) {
    return routeError(e);
  }
}

export function GET(): Response {
  return fail(ERROR_CODE.NOT_IMPLEMENTED, 501);
}
