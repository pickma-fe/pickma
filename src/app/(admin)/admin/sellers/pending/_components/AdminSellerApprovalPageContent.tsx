'use client';

import { useMemo, useState } from 'react';

import type { AdminPendingSellerApplicationResponse } from '@/contracts/admin';
import { useSellerApplicationDocumentReadUrl } from '@/hooks/admin/seller-application-documents/useSellerApplicationDocumentReadUrl';
import { useAdminPendingSellerApplications } from '@/hooks/admin/sellers/useAdminPendingSellerApplications';
import { useApproveSellerApplication } from '@/hooks/admin/sellers/useApproveSellerApplication';
import { useRejectSellerApplication } from '@/hooks/admin/sellers/useRejectSellerApplication';
import { Button } from '@/components/common/Button/Button';

import { AdminSellerApplicationApproveModal } from './AdminSellerApplicationApproveModal';
import { AdminSellerApplicationDetailModal } from './AdminSellerApplicationDetailModal';
import { AdminSellerApplicationRejectModal } from './AdminSellerApplicationRejectModal';
import { AdminSellerApprovalFilters } from './AdminSellerApprovalFilters';
import { AdminSellerApprovalTable } from './AdminSellerApprovalTable';

const PAGE_SIZE = 10;

function getApplicationSearchText(
  application: AdminPendingSellerApplicationResponse
): string {
  return [
    application.companyName,
    application.representativeName,
    application.applicantName,
    application.applicantEmail,
    application.applicantPhone,
    application.businessNumber,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function AdminSellerApprovalPageContent() {
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [detailApplication, setDetailApplication] =
    useState<AdminPendingSellerApplicationResponse>();
  const [approveApplication, setApproveApplication] =
    useState<AdminPendingSellerApplicationResponse>();
  const [rejectApplication, setRejectApplication] =
    useState<AdminPendingSellerApplicationResponse>();
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingActionId, setPendingActionId] = useState<string>();

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminPendingSellerApplications(page, PAGE_SIZE);
  const approveMutation = useApproveSellerApplication();
  const rejectMutation = useRejectSellerApplication();
  const documentReadUrlMutation = useSellerApplicationDocumentReadUrl();

  const applications = useMemo(() => data?.items ?? [], [data?.items]);
  const categories = useMemo(
    () => [...new Set(applications.map((item) => item.businessCategory))],
    [applications]
  );
  const filteredApplications = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesKeyword =
        keyword.length === 0 ||
        getApplicationSearchText(application).includes(keyword);
      const matchesDate =
        selectedDate.length === 0 ||
        application.createdAt.slice(0, 10) === selectedDate;
      const matchesCategory =
        selectedCategory.length === 0 ||
        application.businessCategory === selectedCategory;

      return matchesKeyword && matchesDate && matchesCategory;
    });
  }, [applications, searchKeyword, selectedDate, selectedCategory]);

  function resetFilters() {
    setSearchKeyword('');
    setSelectedDate('');
    setSelectedCategory('');
    setPage(1);
  }

  async function handleApprove() {
    if (!approveApplication) return;

    setMessage('');
    setActionError('');
    setPendingActionId(approveApplication.id);

    try {
      await approveMutation.mutateAsync(approveApplication.id);
      setMessage(`${approveApplication.companyName} 신청을 승인했습니다.`);
      setApproveApplication(undefined);
    } catch {
      setActionError('승인 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setPendingActionId(undefined);
    }
  }

  async function handleReject(reason: string) {
    if (!rejectApplication) return;

    setMessage('');
    setActionError('');
    setPendingActionId(rejectApplication.id);

    try {
      await rejectMutation.mutateAsync({
        id: rejectApplication.id,
        reason,
      });
      setMessage(`${rejectApplication.companyName} 신청을 거절했습니다.`);
      setRejectApplication(undefined);
    } catch {
      setActionError('거절 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setPendingActionId(undefined);
    }
  }

  async function handleOpenDocument(documentId: string) {
    setActionError('');

    try {
      const { signedUrl } =
        await documentReadUrlMutation.mutateAsync(documentId);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      setActionError('문서 열람 URL을 가져오지 못했습니다.');
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">판매자 승인</h1>
        <p className="mt-2 text-sm text-gray-500">
          신규 판매자 신청 내역을 확인하고 승인 또는 거절할 수 있습니다.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white px-5 py-4">
        <p className="text-sm font-semibold text-gray-900">
          검토 대기 신청 {data?.totalCount ?? 0}건
        </p>
      </section>

      <AdminSellerApprovalFilters
        searchKeyword={searchKeyword}
        selectedDate={selectedDate}
        selectedCategory={selectedCategory}
        categories={categories}
        onSearchKeywordChange={(value) => {
          setSearchKeyword(value);
          setPage(1);
        }}
        onSelectedDateChange={(value) => {
          setSelectedDate(value);
          setPage(1);
        }}
        onSelectedCategoryChange={(value) => {
          setSelectedCategory(value);
          setPage(1);
        }}
        onReset={resetFilters}
      />

      {message && (
        <div className="border-primary-100 bg-primary-50 text-primary-700 rounded-md border px-4 py-3 text-sm">
          {message}
        </div>
      )}
      {actionError && (
        <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </div>
      )}
      {isError && (
        <div className="flex items-center justify-between gap-4 rounded-md border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : '판매자 신청 목록을 불러오지 못했습니다.'}
          </p>
          <Button
            variant="outline"
            color="danger"
            className="h-8 px-3 text-xs"
            onClick={() => void refetch()}
          >
            다시 시도
          </Button>
        </div>
      )}

      <AdminSellerApprovalTable
        applications={filteredApplications}
        isLoading={isLoading || isFetching}
        currentPage={page}
        totalPages={data?.totalPages ?? 1}
        pendingActionId={pendingActionId}
        onPageChange={setPage}
        onApprove={setApproveApplication}
        onReject={setRejectApplication}
        onOpenDetail={setDetailApplication}
      />

      <AdminSellerApplicationApproveModal
        application={approveApplication}
        isSubmitting={approveMutation.isPending}
        onClose={() => setApproveApplication(undefined)}
        onSubmit={() => void handleApprove()}
      />
      <AdminSellerApplicationDetailModal
        application={detailApplication}
        isDocumentLoading={documentReadUrlMutation.isPending}
        onClose={() => setDetailApplication(undefined)}
        onOpenDocument={(documentId) => void handleOpenDocument(documentId)}
      />
      <AdminSellerApplicationRejectModal
        key={rejectApplication?.id ?? 'reject-modal'}
        application={rejectApplication}
        isSubmitting={rejectMutation.isPending}
        onClose={() => setRejectApplication(undefined)}
        onSubmit={(reason) => void handleReject(reason)}
      />
    </div>
  );
}
