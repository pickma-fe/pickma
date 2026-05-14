import type {
  CreateFileUploadUrlRequest,
  FileUploadPurpose,
  FileUploadUrlResponse,
  SellerApplicationDocumentType,
} from '@/contracts/file';
import { apiClient } from '@/api/apiClient';

interface UploadFileOptions {
  documentType?: SellerApplicationDocumentType;
}

interface SellerDocumentUploadOptions {
  documentType: SellerApplicationDocumentType;
}

export function createUploadUrl(
  req: CreateFileUploadUrlRequest
): Promise<FileUploadUrlResponse> {
  return apiClient.post<FileUploadUrlResponse>('/api/files/upload-url', req);
}

export function uploadFile(
  purpose: 'seller_application_document',
  file: File,
  options: SellerDocumentUploadOptions
): Promise<string>;
export function uploadFile(
  purpose: Exclude<FileUploadPurpose, 'seller_application_document'>,
  file: File,
  options?: UploadFileOptions
): Promise<string>;
export async function uploadFile(
  purpose: FileUploadPurpose,
  file: File,
  options?: UploadFileOptions
): Promise<string> {
  const { signedUrl, storagePath } = await createUploadUrl({
    purpose,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    documentType: options?.documentType,
  });

  const res = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`FILE_UPLOAD_FAILED: ${res.status}`);
  }

  return storagePath;
}

export function uploadFiles(
  purpose: 'seller_application_document',
  files: File[],
  options: SellerDocumentUploadOptions
): Promise<string[]>;
export function uploadFiles(
  purpose: Exclude<FileUploadPurpose, 'seller_application_document'>,
  files: File[],
  options?: UploadFileOptions
): Promise<string[]>;
export function uploadFiles(
  purpose: FileUploadPurpose,
  files: File[],
  options?: UploadFileOptions
): Promise<string[]> {
  if (purpose === 'seller_application_document') {
    return Promise.all(
      files.map((file) =>
        uploadFile(purpose, file, options as SellerDocumentUploadOptions)
      )
    );
  }
  return Promise.all(files.map((file) => uploadFile(purpose, file, options)));
}

export const fileApi = {
  createUploadUrl,
  uploadFile,
  uploadFiles,
};
