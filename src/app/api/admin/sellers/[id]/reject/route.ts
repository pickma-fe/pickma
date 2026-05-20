import type { NextRequest } from 'next/server';

import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';

import {
  paramsIdSchema,
  rejectSellerApplicationSchema,
} from '../../_lib/schemas';
import { rejectSellerApplication } from '../../_lib/service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = paramsIdSchema.parse(await params);

  if (isApiMockEnabled()) return success(null);

  try {
    await requireAdmin();
    const body = await validateBody(rejectSellerApplicationSchema, request);
    await rejectSellerApplication(id, body.reason);
    return success(null);
  } catch (error) {
    return routeError(error);
  }
}
