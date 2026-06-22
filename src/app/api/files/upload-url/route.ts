import type { NextRequest } from 'next/server';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import {
  checkApplicationEligibility,
  requireActiveUser,
  requireSeller,
  requireSellerStore,
} from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';

import { createFileUploadUrlSchema } from './_lib/schemas';
import { createFileUploadUrl, isPublicUploadPurpose } from './_lib/service';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await validateBody(createFileUploadUrlSchema, request);

    if (isApiMockEnabled()) {
      const isPublicPurpose = isPublicUploadPurpose(body.purpose);
      const storagePath = `mock/${body.purpose}/mock-file`;
      return success(
        {
          signedUrl: '/api/mock/upload',
          storagePath,
          ...(isPublicPurpose && {
            publicUrl: `/images/mock/${body.purpose}/mock-file`,
          }),
        },
        201
      );
    }

    let userId: string;
    let storeId: string | undefined;

    if (body.purpose === 'profile_image') {
      const { authUser } = await requireActiveUser();
      userId = authUser.id;
    } else if (body.purpose === 'seller_application_document') {
      const { authUser, serviceUser } = await requireActiveUser();
      const eligibility = await checkApplicationEligibility(
        authUser.id,
        serviceUser.role
      );
      if (!eligibility.eligible) {
        if (eligibility.reason === 'seller_already_registered') {
          throw new AppError(ERROR_CODE.SELLER_ALREADY_REGISTERED, 409);
        }
        if (eligibility.reason === 'application_already_submitted') {
          throw new AppError(ERROR_CODE.APPLICATION_ALREADY_SUBMITTED, 409);
        }
        throw new AppError(ERROR_CODE.FILE_UPLOAD_NOT_ALLOWED, 403);
      }
      userId = authUser.id;
    } else if (body.purpose === 'store_image') {
      const { authUser } = await requireSeller();
      userId = authUser.id;
    } else {
      // seller_product_image
      const { authUser, store } = await requireSellerStore();
      userId = authUser.id;
      storeId = store.id;
    }

    const data = await createFileUploadUrl(body, userId, storeId);
    return success(data, 201);
  } catch (error) {
    return routeError(error);
  }
}
