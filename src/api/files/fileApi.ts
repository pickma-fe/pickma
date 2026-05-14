import type {
  CreateFileUploadUrlRequest,
  FileUploadPurpose,
  FileUploadUrlResponse,
  SellerApplicationDocumentType,
} from '@/contracts/file';
import { apiClient } from '@/api/apiClient';

interface UploadFileOptions {
  documentType?: SellerApplicationDocumentType;
  storeId?: string;
}

export function createUploadUrl(
  req: CreateFileUploadUrlRequest
): Promise<FileUploadUrlResponse> {
  return apiClient.post<FileUploadUrlResponse>('/api/files/upload-url', req);
}

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
    storeId: options?.storeId,
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
  purpose: FileUploadPurpose,
  files: File[],
  options?: UploadFileOptions
): Promise<string[]> {
  return Promise.all(files.map((file) => uploadFile(purpose, file, options)));
}

export const fileApi = {
  createUploadUrl,
  uploadFile,
  uploadFiles,
};
