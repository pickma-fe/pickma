import type { NextRequest } from 'next/server';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';

import {
  paramsApplicationIdSchema,
  rejectSellerApplicationSchema,
} from '../../_lib/schemas';
import { rejectSellerApplication } from '../../_lib/service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
): Promise<Response> {
  if (isApiMockEnabled()) return success(null);

  try {
    await requireAdmin();
    const result = paramsApplicationIdSchema.safeParse(await params);
    if (!result.success)
      throw new AppError(
        ERROR_CODE.VALIDATION_ERROR,
        400,
        undefined,
        result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }))
      );
    const { applicationId } = result.data;
    const body = await validateBody(rejectSellerApplicationSchema, request);
    await rejectSellerApplication(applicationId, body.reason);
    return success(null);
  } catch (error) {
    return routeError(error);
  }
}
