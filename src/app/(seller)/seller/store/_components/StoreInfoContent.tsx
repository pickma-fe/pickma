'use client';

import { useState } from 'react';

import type { SellerApplicationDocument } from '@/types/seller-application';
import { useMySellerApplication } from '@/hooks/seller/applications/useMySellerApplication';
import { useMyStore } from '@/hooks/stores/useMyStore';
import { useUpdateStore } from '@/hooks/stores/useUpdateStore';
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

const DOC_TYPE_LABEL: Record<string, string> = {
  business_license: '사업자 등록증',
  food_service_permit: '영업신고증',
  bank_account: '통장 사본',
};

export function StoreInfoContent() {
  const { data: storeInfo, isLoading, isError } = useMyStore();
  const { mutate: updateStore, isPending: isUpdating } = useUpdateStore();
  const { data: application, isLoading: isApplicationLoading } =
    useMySellerApplication();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<SellerApplicationDocument | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenModal = (modal: ModalType) => {
    setActiveModal(modal);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedDocument(null);
  };

  const handleViewDocument = (documentId: string) => {
    const doc = application?.documents.find((d) => d.id === documentId);
    if (!doc) return;
    setSelectedDocument(doc);
    setActiveModal('viewCertification');
  };

  const handleToggleOperation = () => {
    if (!storeInfo) return;
    updateStore(
      {
        operationStatus:
          storeInfo.operationStatus === 'open' ? 'closed' : 'open',
      },
      {
        onSuccess: () => {
          showToast(
            storeInfo.operationStatus === 'open'
              ? '영업이 종료되었습니다.'
              : '영업을 시작했습니다.'
          );
        },
        onError: () => {
          showToast('운영 상태 변경에 실패했습니다.');
        },
      }
    );
  };

  const handleStoreEdit = (data: StoreEditData) => {
    updateStore(
      {
        name: data.name,
        phone: data.phone,
        address: data.address,
        addressDetail: data.addressDetail || undefined,
        region: data.region,
        description: data.description || undefined,
        openTime: `${data.openTime}:00`,
        closeTime: `${data.closeTime}:00`,
      },
      {
        onSuccess: () => {
          showToast('가게 정보가 저장되었습니다.');
          handleCloseModal();
        },
        onError: () => {
          showToast('가게 정보 저장에 실패했습니다.');
        },
      }
    );
  };

  const handleImageEdit = (imageUrl: string, file?: File) => {
    if (file) {
      updateStore(
        { imageFile: file },
        {
          onSuccess: () => {
            showToast('이미지가 변경되었습니다.');
            handleCloseModal();
          },
          onError: () => {
            showToast('이미지 변경에 실패했습니다.');
          },
        }
      );
    } else {
      handleCloseModal();
    }
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
        <OperationInfoSection
          storeInfo={storeInfo}
          onToggleOperation={handleToggleOperation}
          isToggling={isUpdating}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <StoreImageSection
          storeInfo={storeInfo}
          onEditImage={() => handleOpenModal('editImage')}
        />
        <CertificationSection
          documents={application?.documents ?? []}
          applicationStatus={application?.status ?? 'pending'}
          onViewDocument={handleViewDocument}
          isLoading={isApplicationLoading}
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
          isPending={isUpdating}
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
          isPending={isUpdating}
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'viewCertification'}
        onClose={handleCloseModal}
        title={
          selectedDocument
            ? (DOC_TYPE_LABEL[selectedDocument.type] ?? '제출 서류')
            : '제출 서류'
        }
        size="md"
      >
        {selectedDocument && (
          <CertificationDetailModal
            document={selectedDocument}
            onClose={handleCloseModal}
          />
        )}
      </Modal>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
