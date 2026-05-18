import type { NextRequest } from 'next/server';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import {
  checkApplicationEligibility,
  requireActiveUser,
} from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockSellerApplication } from '@/mocks/seller';

import { createSellerApplicationSchema } from './_lib/schemas';
import { createSellerApplication } from './_lib/service';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await validateBody(createSellerApplicationSchema, request);

    if (isApiMockEnabled()) {
      return success(mockSellerApplication, 201);
    }

    const { authUser, serviceUser } = await requireActiveUser();

    const eligibility = await checkApplicationEligibility(
      authUser.id,
      serviceUser.role
    );

    if (!eligibility.eligible) {
      const code =
        eligibility.reason === 'seller_already_registered'
          ? ERROR_CODE.SELLER_ALREADY_REGISTERED
          : ERROR_CODE.APPLICATION_ALREADY_SUBMITTED;
      return fail(code);
    }

    const data = await createSellerApplication(authUser.id, body);
    return success(data, 201);
  } catch (error) {
    return routeError(error);
  }
}
