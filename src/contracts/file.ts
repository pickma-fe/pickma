import type { SellerApplicationDocumentType } from './seller-application';

export type { SellerApplicationDocumentType };

export type FileUploadPurpose =
  | 'seller_application_document'
  | 'store_image'
  | 'seller_product_image'
  | 'profile_image';

export interface CreateFileUploadUrlRequest {
  purpose: FileUploadPurpose;
  fileName: string;
  fileSize: number;
  mimeType: string;
  documentType?: SellerApplicationDocumentType;
}

export interface FileUploadUrlResponse {
  signedUrl: string;
  storagePath: string;
}

export interface DeleteFilesRequest {
  storagePaths: string[];
}
