import type { NextRequest } from 'next/server';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';

import { completeEmailSignupSchema } from '../_lib/schemas';
import { completeEmailSignup } from '../_lib/signup-service';

export async function POST(request: NextRequest): Promise<Response> {
  if (isApiMockEnabled()) {
    return success(null);
  }

  try {
    const { email, verificationToken, password, name } = await validateBody(
      completeEmailSignupSchema,
      request
    );
    await completeEmailSignup(email, verificationToken, password, name);
    return success(null);
  } catch (e) {
    return routeError(e);
  }
}

export function GET(): Response {
  return fail(ERROR_CODE.NOT_IMPLEMENTED, 501);
}
