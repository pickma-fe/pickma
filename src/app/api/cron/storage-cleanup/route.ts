import type { NextRequest } from 'next/server';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createLogger, generateReqId } from '@/app/api/_lib/logger';
import { fail, routeError, success } from '@/app/api/_lib/response';

import { runStorageCleanup } from './_lib/service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return fail(ERROR_CODE.UNAUTHORIZED, 401);
  }

  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${secret}`) {
    return fail(ERROR_CODE.UNAUTHORIZED, 401);
  }

  const reqId = generateReqId();
  const logger = createLogger(reqId);

  try {
    const { deletedCount } = await runStorageCleanup(logger);
    const res = success({ deletedCount });
    res.headers.set('X-Request-Id', reqId);
    return res;
  } catch (error) {
    return routeError(error);
  }
}
