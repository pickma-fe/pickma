import type { NextRequest } from 'next/server';

import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';

import { deleteFilesSchema } from './_lib/schemas';
import { deleteStorageFiles } from './_lib/service';

export async function DELETE(request: NextRequest): Promise<Response> {
  try {
    const body = await validateBody(deleteFilesSchema, request);

    if (isApiMockEnabled()) return success(null);

    const { authUser } = await requireActiveUser();
    await deleteStorageFiles(authUser.id, body.storagePaths);
    return success(null);
  } catch (error) {
    return routeError(error);
  }
}
