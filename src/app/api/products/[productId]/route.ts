import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServerClient } from '@/lib/supabase/server';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { mockProductDetailsMap } from '@/mocks/products';

import { productIdSchema } from '../_lib/schemas';
import { getProductById } from '../_lib/service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
): Promise<Response> {
  const { productId } = await params;

  if (isApiMockEnabled()) {
    const detail = mockProductDetailsMap[productId];
    if (!detail) return fail(ERROR_CODE.PRODUCT_NOT_FOUND);
    return success(detail);
  }

  const parsed = productIdSchema.safeParse(productId);
  if (!parsed.success) return fail(ERROR_CODE.VALIDATION_ERROR, 400);

  try {
    const supabase = await createServerClient();
    const data = await getProductById(supabase, parsed.data);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
