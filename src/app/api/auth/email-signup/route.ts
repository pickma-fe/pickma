import type { NextRequest } from 'next/server';

import { createLogger, generateReqId } from '@/app/api/_lib/logger';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';

import { completeEmailSignupSchema } from '../_lib/schemas';
import { completeEmailSignup } from '../_lib/signup-service';

export async function POST(request: NextRequest): Promise<Response> {
  if (isApiMockEnabled()) {
    return success(null);
  }

  const logger = createLogger(generateReqId());

  try {
    const { email, verificationToken, password, name, marketingAgreed } =
      await validateBody(completeEmailSignupSchema, request);
    await completeEmailSignup(
      email,
      verificationToken,
      password,
      name,
      marketingAgreed,
      logger
    );
    return success(null);
  } catch (e) {
    return routeError(e);
  }
}
