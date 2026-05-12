'use client';

import { useState } from 'react';

import type { MyStore } from '@/types/store';
import { useMyStore } from '@/hooks/stores/useMyStore';
import { Badge } from '@/components/common/Badge/Badge';
import { Button } from '@/components/common/Button/Button';
import { Modal } from '@/components/common/Modal/Modal';
import { Section } from '@/components/common/Section/Section';

import { BasicInfoSection } from './BasicInfoSection';
import { CertificationDetailModal } from './CertificationDetailModal';
import { CertificationSection } from './CertificationSection';
import { OperationInfoSection } from './OperationInfoSection';
import { StoreEditForm } from './StoreEditForm';
import type { StoreEditData } from './StoreEditForm';
import { StoreImageEditForm } from './StoreImageEditForm';
import { StoreImageSection } from './StoreImageSection';

type ModalType = 'editStore' | 'editImage' | 'viewCertification' | null;

interface CertificationData {
  status: boolean;
  imageUrl?: string;
  expiresAt?: string;
}

const INITIAL_CERTIFICATIONS: Record<string, CertificationData> = {
  // 판매자 인증 서류 (register에서 제출 - store 접근 시 항상 완료 상태)
  businessLicense: {
    status: true,
    imageUrl: '/images/mock/business-license.jpeg',
  },
  idCard: { status: true, imageUrl: '/images/mock/id-card.jpeg' },
  bankbook: { status: true, imageUrl: '/images/mock/bankbook.jpeg' },
  businessReport: {
    status: true,
    imageUrl: '/images/mock/business-report.jpeg',
  },
  salesLicense: { status: false, imageUrl: undefined },
  hygieneLicense: { status: false, imageUrl: undefined, expiresAt: undefined },
};

const CERT_KEY_MAP: Record<string, string> = {
  '사업자 등록증': 'businessLicense',
  '대표자 신분증': 'idCard',
  '통장 사본': 'bankbook',
  '영업 신고증': 'businessReport',
  '통신판매업 신고증': 'salesLicense',
  '위생교육 수료증': 'hygieneLicense',
};
const REGISTER_CERTS = [
  '사업자 등록증',
  '대표자 신분증',
  '통장 사본',
  '영업 신고증',
];

export function StoreInfoContent() {
  const { data: initialStoreInfo, isLoading, isError } = useMyStore();
  const [editedStore, setEditedStore] = useState<Partial<MyStore> | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedCertification, setSelectedCertification] = useState<
    string | null
  >(null);
  const [certifications, setCertifications] = useState(INITIAL_CERTIFICATIONS);

  const storeInfo = editedStore
    ? ({ ...initialStoreInfo, ...editedStore } as MyStore)
    : initialStoreInfo;

  const certificationStatus = {
    businessLicense: certifications.businessLicense.status,
    idCard: certifications.idCard.status,
    bankbook: certifications.bankbook.status,
    businessReport: certifications.businessReport.status,
    salesLicense: certifications.salesLicense.status,
    hygieneLicense: certifications.hygieneLicense.status,
  };

  const handleOpenModal = (modal: ModalType) => {
    setActiveModal(modal);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedCertification(null);
  };

  const handleViewCertification = (label: string) => {
    setSelectedCertification(label);
    setActiveModal('viewCertification');
  };

  const handleStoreEdit = (data: StoreEditData) => {
    setEditedStore({
      ...editedStore,
      name: data.name,
      phone: data.phone,
      address: data.address,
      addressDetail: data.addressDetail,
      region: data.region,
      description: data.description,
      openTime: `${data.openTime}:00`,
      closeTime: `${data.closeTime}:00`,
    });
    handleCloseModal();
    // TODO: API 연동 시 실제 수정 API 호출
  };

  const handleImageEdit = (imageUrl: string) => {
    setEditedStore({
      ...editedStore,
      image: imageUrl,
    });
    handleCloseModal();
    // TODO: API 연동 시 실제 이미지 업로드 API 호출
  };

  const handleCertificationSubmit = (certLabel: string, imageUrl: string) => {
    const key = CERT_KEY_MAP[certLabel];
    if (key) {
      const newData: CertificationData = {
        status: true,
        imageUrl,
      };

      if (certLabel === '위생교육 수료증') {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        newData.expiresAt = nextYear.toISOString().split('T')[0];
      }

      setCertifications((prev) => ({
        ...prev,
        [key]: newData,
      }));
    }
    handleCloseModal();
    // TODO: API 연동 시 실제 인증서 제출 API 호출
  };

  const getSelectedCertData = () => {
    if (!selectedCertification) return null;
    const key = CERT_KEY_MAP[selectedCertification];
    return certifications[key];
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        가게 정보를 불러오는데 실패했습니다.
      </div>
    );
  }

  if (!storeInfo) {
    return (
      <div className="p-8 text-center text-gray-500">가게 정보가 없습니다.</div>
    );
  }

  const selectedCertData = getSelectedCertData();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          가게 정보
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          가게 정보를 확인하고 관리할 수 있습니다.
        </p>
      </div>

      <Section variant="card" className="bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <span className="text-xl">🏪</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">
                  {storeInfo.name}
                </h2>
                <Badge
                  variant="soft"
                  color={storeInfo.canSell ? 'success' : 'gray'}
                >
                  {storeInfo.canSell ? '판매중' : '판매중지'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                ID: {storeInfo.id} | {storeInfo.region}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            color="gray"
            onClick={() => handleOpenModal('editStore')}
          >
            가게 정보 수정
          </Button>
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <BasicInfoSection storeInfo={storeInfo} />
        <OperationInfoSection storeInfo={storeInfo} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <StoreImageSection
          storeInfo={storeInfo}
          onEditImage={() => handleOpenModal('editImage')}
        />
        <CertificationSection
          onViewCertification={handleViewCertification}
          certificationStatus={certificationStatus}
        />
      </div>

      <Modal
        isOpen={activeModal === 'editStore'}
        onClose={handleCloseModal}
        title="가게 정보 수정"
        size="lg"
      >
        <StoreEditForm
          storeInfo={storeInfo}
          onSubmit={handleStoreEdit}
          onCancel={handleCloseModal}
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'editImage'}
        onClose={handleCloseModal}
        title="대표 이미지 변경"
        size="md"
      >
        <StoreImageEditForm
          currentImage={storeInfo.image}
          storeName={storeInfo.name}
          onSubmit={handleImageEdit}
          onCancel={handleCloseModal}
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'viewCertification'}
        onClose={handleCloseModal}
        title={selectedCertification ? `${selectedCertification}` : '인증 정보'}
        size="md"
      >
        {selectedCertification && selectedCertData && (
          <CertificationDetailModal
            label={selectedCertification}
            isCompleted={selectedCertData.status}
            imageUrl={selectedCertData.imageUrl}
            expiresAt={selectedCertData.expiresAt}
            onClose={handleCloseModal}
            onSubmit={handleCertificationSubmit}
            canSubmitHere={!REGISTER_CERTS.includes(selectedCertification)}
          />
        )}
      </Modal>
    </div>
  );
}
