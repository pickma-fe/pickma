import type { Store } from '@/types/store';

export type DetailView = 'detail' | 'approve-confirm' | 'reject-reason';

interface PendingStoreDetailContentProps {
  store: Store;
  view: DetailView;
  rejectReason: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onApproveClick: () => void;
  onRejectClick: () => void;
  onApproveConfirm: () => void;
  onRejectConfirm: () => void;
  onCancel: () => void;
  onRejectReasonChange: (value: string) => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function LabeledField({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  );
}

export function PendingStoreDetailContent({
  store,
  view,
  rejectReason,
  isSubmitting,
  errorMessage,
  onClose,
  onApproveClick,
  onRejectClick,
  onApproveConfirm,
  onRejectConfirm,
  onCancel,
  onRejectReasonChange,
}: PendingStoreDetailContentProps) {
  if (view === 'approve-confirm') {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm text-gray-700">
          <span className="font-medium">{store.name}</span>을(를)
          승인하시겠습니까?
        </p>
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onApproveConfirm}
            disabled={isSubmitting}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? '처리 중...' : '확인'}
          </button>
        </div>
      </div>
    );
  }

  if (view === 'reject-reason') {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="reject-reason"
            className="text-sm font-medium text-gray-700"
          >
            거절 사유 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reject-reason"
            value={rejectReason}
            onChange={(e) => onRejectReasonChange(e.target.value)}
            disabled={isSubmitting}
            rows={4}
            placeholder="거절 사유를 입력해주세요."
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50"
          />
        </div>
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onRejectConfirm}
            disabled={isSubmitting || rejectReason.trim() === ''}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? '처리 중...' : '거절 확정'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LabeledField label="가게명" value={store.name} />
        <LabeledField label="지역" value={store.region} />
        <LabeledField label="사업자 번호" value={store.businessNumber} />
        <LabeledField label="전화번호" value={store.phone} />
        <LabeledField label="주소" value={store.address} />
        <LabeledField label="상세 주소" value={store.addressDetail} />
        <LabeledField label="신청일" value={formatDate(store.createdAt)} />
        {store.description && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-gray-500">소개</dt>
            <dd className="mt-1 text-sm text-gray-900">{store.description}</dd>
          </div>
        )}
        {store.image && (
          <div className="sm:col-span-2">
            <dt className="mb-1 text-xs font-medium text-gray-500">이미지</dt>
            <dd>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={store.image}
                alt={store.name}
                className="h-40 w-full rounded-md object-cover"
              />
            </dd>
          </div>
        )}
      </dl>
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          닫기
        </button>
        <button
          type="button"
          onClick={onRejectClick}
          className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          거절
        </button>
        <button
          type="button"
          onClick={onApproveClick}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          승인
        </button>
      </div>
    </div>
  );
}
