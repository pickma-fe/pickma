import type { NextRequest } from 'next/server';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
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
    const result = paramsIdSchema.safeParse(await params);
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
    const { id } = result.data;
    const data = await getSellerApplicationDocumentReadUrl(id);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
