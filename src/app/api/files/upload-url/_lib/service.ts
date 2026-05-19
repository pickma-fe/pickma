import type {
  CreateFileUploadUrlRequest,
  FileUploadPurpose,
  FileUploadUrlResponse,
  SellerApplicationDocumentType,
} from '@/contracts/file';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

interface BucketPolicy {
  bucket: string;
  allowedMimeTypes: string[];
  maxBytes: number;
}

const BUCKET_POLICIES: Record<FileUploadPurpose, BucketPolicy> = {
  seller_application_document: {
    bucket: 'seller-application-documents',
    allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf'],
    maxBytes: 10 * 1024 * 1024,
  },
  store_image: {
    bucket: 'store-images',
    allowedMimeTypes: ['image/png', 'image/jpeg'],
    maxBytes: 5 * 1024 * 1024,
  },
  seller_product_image: {
    bucket: 'product-images',
    allowedMimeTypes: ['image/png', 'image/jpeg'],
    maxBytes: 5 * 1024 * 1024,
  },
  profile_image: {
    bucket: 'profile-images',
    allowedMimeTypes: ['image/png', 'image/jpeg'],
    maxBytes: 3 * 1024 * 1024,
  },
};

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9\-._]/g, '_');
}

function buildStoragePath(
  req: CreateFileUploadUrlRequest,
  userId: string,
  uploadId: string,
  storeId?: string
): string {
  const safeFileName = sanitizeFileName(req.fileName);

  switch (req.purpose) {
    case 'seller_application_document':
      return `${userId}/${uploadId}/${req.documentType as SellerApplicationDocumentType}/${safeFileName}`;
    case 'store_image':
      return `${userId}/${uploadId}/${safeFileName}`;
    case 'seller_product_image': {
      const storePrefix = storeId ?? userId;
      return `${storePrefix}/${uploadId}/${safeFileName}`;
    }
    case 'profile_image':
      return `${userId}/${uploadId}/${safeFileName}`;
  }
}

export async function createFileUploadUrl(
  req: CreateFileUploadUrlRequest,
  userId: string,
  storeId?: string
): Promise<FileUploadUrlResponse> {
  const policy = BUCKET_POLICIES[req.purpose];

  if (!policy.allowedMimeTypes.includes(req.mimeType)) {
    throw new AppError(ERROR_CODE.FILE_TYPE_NOT_ALLOWED, 400);
  }

  if (req.fileSize > policy.maxBytes) {
    throw new AppError(ERROR_CODE.FILE_TOO_LARGE, 400);
  }

  const uploadId = crypto.randomUUID();
  const storagePath = buildStoragePath(req, userId, uploadId, storeId);

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.storage
    .from(policy.bucket)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return {
    signedUrl: data.signedUrl,
    storagePath,
  };
}
