import type { NextRequest } from 'next/server';

import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { mockDocumentReadUrl } from '@/mocks/admin';

import { paramsIdSchema } from '../../_lib/schemas';
import { getSellerApplicationDocumentReadUrl } from '../../_lib/service';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  if (isApiMockEnabled()) return success(mockDocumentReadUrl);

  try {
    await requireAdmin();
    const { id } = paramsIdSchema.parse(await params);
    const data = await getSellerApplicationDocumentReadUrl(id);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
