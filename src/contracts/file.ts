export type FileUploadPurpose =
  | 'seller_application_document'
  | 'store_image'
  | 'seller_product_image'
  | 'profile_image';

export type SellerApplicationDocumentType =
  | 'business_license'
  | 'id_card'
  | 'bankbook'
  | 'business_report';

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
