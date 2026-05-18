import type { NextRequest } from 'next/server';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockCreatedSellerMenuItem } from '@/mocks/seller';

import { menuItemIdSchema, updateMenuItemSchema } from '../_lib/schemas';
import { deleteSellerMenuItem, updateSellerMenuItem } from '../_lib/service';

type Params = Promise<{ menuItemId: string }>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
): Promise<Response> {
  try {
    const { menuItemId } = await params;
    if (!menuItemIdSchema.safeParse(menuItemId).success) {
      throw new AppError(ERROR_CODE.VALIDATION_ERROR, 400);
    }
    const body = await validateBody(updateMenuItemSchema, request);

    if (isApiMockEnabled()) return success(mockCreatedSellerMenuItem);

    const { store } = await requireSellerStore();
    const data = await updateSellerMenuItem(store.id, menuItemId, body);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Params }
): Promise<Response> {
  try {
    const { menuItemId } = await params;
    if (!menuItemIdSchema.safeParse(menuItemId).success) {
      throw new AppError(ERROR_CODE.VALIDATION_ERROR, 400);
    }

    if (isApiMockEnabled()) return success(null);

    const { store } = await requireSellerStore();
    await deleteSellerMenuItem(store.id, menuItemId);
    return success(null);
  } catch (error) {
    return routeError(error);
  }
}
