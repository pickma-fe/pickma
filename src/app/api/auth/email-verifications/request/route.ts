import type { NextRequest } from 'next/server';

import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
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
