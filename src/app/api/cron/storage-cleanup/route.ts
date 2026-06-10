import type { NextRequest } from 'next/server';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
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

  try {
    const { deletedCount } = await runStorageCleanup();
    return success({ deletedCount });
  } catch (error) {
    return routeError(error);
  }
}
