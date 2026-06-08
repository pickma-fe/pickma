import type { SellerApplicationDocument } from '@/types/seller-application';
import { Badge } from '@/components/common/Badge/Badge';
import { Button } from '@/components/common/Button/Button';
import { Section } from '@/components/common/Section/Section';

interface CertificationSectionProps {
  documents: SellerApplicationDocument[];
  applicationStatus: 'pending' | 'approved' | 'rejected';
  onViewDocument: (documentId: string) => void;
  isLoading?: boolean;
}

const CERT_CONFIG = [
  { type: 'business_license' as const, label: '사업자 등록증' },
  { type: 'food_service_permit' as const, label: '영업신고증' },
  { type: 'bank_account' as const, label: '통장 사본' },
] as const;

const APPLICATION_STATUS_BADGE: Record<
  'pending' | 'approved' | 'rejected',
  { label: string; color: 'warning' | 'success' | 'danger' }
> = {
  pending: { label: '심사 중', color: 'warning' },
  approved: { label: '승인 완료', color: 'success' },
  rejected: { label: '반려', color: 'danger' },
};

export function CertificationSection({
  documents,
  applicationStatus,
  onViewDocument,
  isLoading = false,
}: CertificationSectionProps) {
  const docMap = new Map(documents.map((doc) => [doc.type, doc]));
  const statusBadge = APPLICATION_STATUS_BADGE[applicationStatus];

  return (
    <Section variant="card" className="bg-white">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">인증 정보</h3>
        <Badge variant="soft" color={statusBadge.color}>
          {statusBadge.label}
        </Badge>
      </div>

      <p className="mb-2 text-xs font-medium text-gray-500">제출 서류</p>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {CERT_CONFIG.map((cert) => (
            <div key={cert.type} className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{cert.label}</span>
              <div className="h-6 w-24 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : (
        <dl className="flex flex-col gap-3">
          {CERT_CONFIG.map((cert) => {
            const doc = docMap.get(cert.type);
            const isSubmitted = Boolean(doc);

            return (
              <div
                key={cert.type}
                className="flex items-center justify-between"
              >
                <dt className="text-sm text-gray-500">{cert.label}</dt>
                <dd className="flex items-center gap-2">
                  <Badge
                    variant="soft"
                    color={isSubmitted ? 'success' : 'warning'}
                  >
                    {isSubmitted ? '제출 완료' : '미제출'}
                  </Badge>
                  {doc && (
                    <Button
                      variant="outline"
                      color="gray"
                      className="text-xs"
                      onClick={() => onViewDocument(doc.id)}
                    >
                      보기
                    </Button>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </Section>
  );
}
