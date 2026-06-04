'use client';

import { ExternalLink, FileText } from 'lucide-react';

import type { AdminPendingSellerApplicationResponse } from '@/contracts/admin';
import { Button } from '@/components/common/Button/Button';
import { Modal } from '@/components/common/Modal/Modal';

import {
  SELLER_APPLICATION_DOCUMENT_LABELS,
  formatAdminDateTime,
} from './adminSellerApprovalUtils';

interface AdminSellerApplicationDetailModalProps {
  application?: AdminPendingSellerApplicationResponse;
  isDocumentLoading: boolean;
  onClose: () => void;
  onOpenDocument: (documentId: string) => void;
}

export function AdminSellerApplicationDetailModal({
  application,
  isDocumentLoading,
  onClose,
  onOpenDocument,
}: AdminSellerApplicationDetailModalProps) {
  return (
    <Modal
      isOpen={Boolean(application)}
      onClose={onClose}
      title="판매자 신청 상세"
      size="xl"
    >
      {application && (
        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">신청 정보</h3>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-gray-500">상호명</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {application.companyName}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">대표자명</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {application.representativeName}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">사업자등록번호</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {application.businessNumber}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">업종</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {application.businessCategory}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">신청자 이메일</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {application.applicantEmail}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">신청자 연락처</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {application.applicantPhone ?? '등록된 연락처 없음'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-gray-500">사업장 주소</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {application.businessAddress}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">신청일</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {formatAdminDateTime(application.createdAt)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">제출 문서</h3>
            {application.documents.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">
                제출된 문서가 없습니다.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {application.documents.map((document) => (
                  <li
                    key={document.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-gray-100 px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText className="text-primary-500 h-5 w-5 shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {SELLER_APPLICATION_DOCUMENT_LABELS[document.type]}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {document.originalFileName}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      color="gray"
                      className="h-8 shrink-0 gap-1 px-3 text-xs"
                      disabled={isDocumentLoading}
                      onClick={() => onOpenDocument(document.id)}
                    >
                      열기
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
