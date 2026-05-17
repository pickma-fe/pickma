import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/app/api/_lib/auth';
import { routeError, success } from '@/app/api/_lib/response';

import { getSellerApplicationDocumentReadUrl } from '../../_lib/service';

const paramsSchema = z.object({ id: z.string().uuid() });

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin();
    const { id } = paramsSchema.parse(await params);
    const data = await getSellerApplicationDocumentReadUrl(id);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
