import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
): Promise<Response> {
  const { paymentId } = await params;

  if (!paymentId) {
    return fail(ERROR_CODE.VALIDATION_ERROR, 400, [
      { path: 'paymentId', message: 'paymentId is required' },
    ]);
  }

  if (isApiMockEnabled()) return success(undefined);

  try {
    await requireActiveUser();
    return fail(ERROR_CODE.NOT_IMPLEMENTED);
  } catch (error) {
    return routeError(error);
  }
}
