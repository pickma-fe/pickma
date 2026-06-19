'use client';

import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { useSellerProduct } from '@/hooks/seller/products/useSellerProduct';
import { useUpdateSellerProduct } from '@/hooks/seller/products/useUpdateSellerProduct';
import type { ProductEditFormData } from '@/components/seller/products/ProductEditForm';
import { ProductEditForm } from '@/components/seller/products/ProductEditForm';

export default function SellerProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: product, isLoading, isError } = useSellerProduct(id);
  const { mutate: updateProduct, isPending } = useUpdateSellerProduct();

  const handleSubmit = (data: ProductEditFormData) => {
    if (!product) return;
    const endAt = new Date(product.endAt);
    const [hour, minute] = data.pickupEndTime.split(':').map(Number);
    endAt.setHours(hour, minute, 0, 0);

    updateProduct(
      {
        id,
        body: {
          discountPrice: Number(data.discountPrice),
          stock: Number(data.stock),
          endAt,
          pickupStartTime: data.pickupStartTime,
          pickupEndTime: data.pickupEndTime,
          status: data.status,
        },
      },
      {
        onSuccess: () => {
          router.push('/seller/products');
        },
      }
    );
  };

  const handleCancel = () => {
    router.push('/seller/products');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-sm text-gray-500">
        상품 정보를 불러오는 중입니다.
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-80 items-center justify-center text-sm text-red-500">
        상품 정보를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          type="button"
          onClick={handleCancel}
          className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          aria-label="상품 목록으로 돌아가기"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          상품 목록으로
        </button>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          상품 수정
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          상품의 판매가, 재고, 픽업 시간 등을 수정할 수 있습니다.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ProductEditForm
          product={product}
          isPending={isPending}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="수정 완료"
        />
      </div>
    </div>
  );
}
