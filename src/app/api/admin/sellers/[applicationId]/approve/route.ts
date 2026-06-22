import type { NextRequest } from 'next/server';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireAdmin } from '@/app/api/_lib/auth';
import { createLogger, generateReqId } from '@/app/api/_lib/logger';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';

import { paramsApplicationIdSchema } from '../../_lib/schemas';
import { approveSellerApplication } from '../../_lib/service';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
): Promise<Response> {
  const reqId = generateReqId();
  const logger = createLogger(reqId);

  if (isApiMockEnabled()) {
    const res = success(null);
    res.headers.set('X-Request-Id', reqId);
    return res;
  }

  try {
    const { authUser } = await requireAdmin();
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
    await approveSellerApplication(applicationId);
    logger.info('ADMIN_APPROVE_SELLER_SUCCEEDED', {
      adminUserId: authUser.id,
      applicationId,
    });
    const res = success(null);
    res.headers.set('X-Request-Id', reqId);
    return res;
  } catch (error) {
    return routeError(error);
  }
}
