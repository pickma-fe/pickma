import { Badge } from '@/components/common/Badge/Badge';
import { Button } from '@/components/common/Button/Button';
import { Section } from '@/components/common/Section/Section';

interface CertificationSectionProps {
  onViewCertification: (label: string) => void;
  certificationStatus: Record<string, boolean>;
}

const REGISTER_CERTS = [
  { label: '사업자 등록증', key: 'businessLicense' },
  { label: '대표자 신분증', key: 'idCard' },
  { label: '통장 사본', key: 'bankbook' },
  { label: '영업 신고증', key: 'businessReport' },
];

const STORE_CERTS = [
  { label: '통신판매업 신고증', key: 'salesLicense' },
  { label: '위생교육 수료증', key: 'hygieneLicense' },
];

export function CertificationSection({
  onViewCertification,
  certificationStatus,
}: CertificationSectionProps) {
  return (
    <Section variant="card" className="bg-white">
      <h3 className="mb-4 text-base font-semibold text-gray-900">인증 정보</h3>

      <p className="mb-2 text-xs font-medium text-gray-500">판매자 인증 서류</p>
      <dl className="mb-4 flex flex-col gap-3">
        {REGISTER_CERTS.map((cert) => {
          const isCompleted = certificationStatus[cert.key] || false;
          return (
            <div key={cert.label} className="flex items-center justify-between">
              <dt className="text-sm text-gray-500">{cert.label}</dt>
              <dd className="flex items-center gap-2">
                <Badge
                  variant="soft"
                  color={isCompleted ? 'success' : 'warning'}
                >
                  {isCompleted ? '제출 완료' : '미제출'}
                </Badge>
                <Button
                  variant="outline"
                  color="gray"
                  className="text-xs"
                  onClick={() => onViewCertification(cert.label)}
                >
                  보기
                </Button>
              </dd>
            </div>
          );
        })}
      </dl>

      <p className="mb-2 text-xs font-medium text-gray-500">추가 인증 서류</p>
      <dl className="flex flex-col gap-3">
        {STORE_CERTS.map((cert) => {
          const isCompleted = certificationStatus[cert.key] || false;
          return (
            <div key={cert.label} className="flex items-center justify-between">
              <dt className="text-sm text-gray-500">{cert.label}</dt>
              <dd className="flex items-center gap-2">
                <Badge
                  variant="soft"
                  color={isCompleted ? 'success' : 'warning'}
                >
                  {isCompleted ? '인증 완료' : '신청 필요'}
                </Badge>
                <Button
                  variant="outline"
                  color="gray"
                  className="text-xs"
                  onClick={() => onViewCertification(cert.label)}
                >
                  보기
                </Button>
              </dd>
            </div>
          );
        })}
      </dl>
    </Section>
  );
}
