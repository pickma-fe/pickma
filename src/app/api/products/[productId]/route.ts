import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, success } from '@/app/api/_lib/response';
import { mockProductDetailsMap } from '@/mocks/products';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
): Promise<Response> {
  if (!isApiMockEnabled()) {
    return fail(ERROR_CODE.NOT_IMPLEMENTED);
  }

  const { productId } = await params;
  const detail = mockProductDetailsMap[productId];
  if (!detail) {
    return fail(ERROR_CODE.PRODUCT_NOT_FOUND);
  }

  return success(detail);
}
