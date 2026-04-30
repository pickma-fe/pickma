import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, success } from '@/app/api/_lib/response';
import { mockProductList } from '@/mocks/products';

export async function GET(): Promise<Response> {
  if (!isApiMockEnabled()) {
    return fail(ERROR_CODE.NOT_IMPLEMENTED);
  }

  return success(mockProductList);
}
