import type { NextRequest } from 'next/server';

import { requireSellerStore } from '@/app/api/_lib/auth';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody, validateQuery } from '@/app/api/_lib/validation';

import { createMenuItemSchema, sellerMenuItemListSchema } from './_lib/schemas';
import { createSellerMenuItem, getSellerMenuItems } from './_lib/service';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const params = validateQuery(
      sellerMenuItemListSchema,
      request.nextUrl.searchParams
    );
    const { store } = await requireSellerStore();
    const data = await getSellerMenuItems(store.id, params);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await validateBody(createMenuItemSchema, request);
    const { store } = await requireSellerStore();
    const data = await createSellerMenuItem(store.id, body);
    return success(data, 201);
  } catch (error) {
    return routeError(error);
  }
}
