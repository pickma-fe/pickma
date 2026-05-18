import type { NextRequest } from 'next/server';

import { requireAdmin } from '@/app/api/_lib/auth';
import { routeError, success } from '@/app/api/_lib/response';

import { paramsIdSchema } from '../../_lib/schemas';
import { approveSellerApplication } from '../../_lib/service';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { id } = paramsIdSchema.parse(await params);
    await approveSellerApplication(id);
    return success(null);
  } catch (error) {
    return routeError(error);
  }
}
