'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import type { CreateSellerProductRequest } from '@/contracts/product';
import { useSellerMenuItems } from '@/hooks/seller/menu-items/useSellerMenuItems';
import { useCreateSellerProduct } from '@/hooks/seller/products/useCreateSellerProduct';
import { Button } from '@/components/common/Button/Button';
import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { Input } from '@/components/common/Input/Input';
import { Modal } from '@/components/common/Modal/Modal';

interface ProductRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const productFormSchema = z.object({
  menuItemId: z.string().min(1, '메뉴를 선택해주세요.'),
  discountPrice: z
    .string()
    .min(1, '판매가를 입력해주세요.')
    .refine(
      (v) => Number.isFinite(Number(v)) && Number(v) >= 1,
      '올바른 판매가를 입력해주세요.'
    ),
  stock: z
    .string()
    .min(1, '재고를 입력해주세요.')
    .refine(
      (v) => Number.isFinite(Number(v)) && Number(v) >= 1,
      '올바른 재고를 입력해주세요.'
    ),
  endAt: z.string().min(1, '마감일시를 입력해주세요.'),
  pickupStartTime: z.string().min(1, '픽업 시작 시간을 입력해주세요.'),
  pickupEndTime: z.string().min(1, '픽업 종료 시간을 입력해주세요.'),
});

type ProductFormData = z.infer<typeof productFormSchema>;

const timeInputClass =
  'rounded-md border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-300';

export function ProductRegistrationModal({
  isOpen,
  onClose,
}: ProductRegistrationModalProps) {
  const { data: menuItems } = useSellerMenuItems();
  const { mutate: createProduct, isPending } = useCreateSellerProduct();

  const menuOptions = (menuItems ?? [])
    .filter((m) => m.status === 'active')
    .map((m) => ({ label: `${m.name} (${m.categoryName})`, value: m.id }));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      menuItemId: '',
      endAt: '',
      pickupStartTime: '',
      pickupEndTime: '',
    },
  });

  const onSubmit = (data: ProductFormData) => {
    const body: CreateSellerProductRequest = {
      menuItemId: data.menuItemId,
      discountPrice: Number(data.discountPrice),
      stock: Number(data.stock),
      endAt: new Date(data.endAt).toISOString(),
      pickupStartTime: data.pickupStartTime,
      pickupEndTime: data.pickupEndTime,
    };
    createProduct(body, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="판매 등록">
      <p className="text-sm text-gray-500">
        판매할 메뉴를 선택하고 상품 정보를 입력해주세요.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">메뉴 *</label>
          <Controller
            name="menuItemId"
            control={control}
            render={({ field }) => (
              <Dropdown
                type="select"
                items={menuOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="메뉴를 선택해주세요"
              />
            )}
          />
          {errors.menuItemId && (
            <p className="text-sm text-red-500">{errors.menuItemId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="판매가 (원) *"
            type="number"
            placeholder="0"
            {...register('discountPrice')}
            error={errors.discountPrice?.message}
          />
          <Input
            label="재고 (개) *"
            type="number"
            placeholder="0"
            {...register('stock')}
            error={errors.stock?.message}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">판매 마감일시 *</label>
          <input
            type="datetime-local"
            {...register('endAt')}
            className={timeInputClass}
          />
          {errors.endAt && (
            <p className="text-sm text-red-500">{errors.endAt.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">픽업 시작 시간 *</label>
            <input
              type="time"
              {...register('pickupStartTime')}
              className={timeInputClass}
            />
            {errors.pickupStartTime && (
              <p className="text-sm text-red-500">
                {errors.pickupStartTime.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">픽업 종료 시간 *</label>
            <input
              type="time"
              {...register('pickupEndTime')}
              className={timeInputClass}
            />
            {errors.pickupEndTime && (
              <p className="text-sm text-red-500">
                {errors.pickupEndTime.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            color="gray"
            onClick={onClose}
            disabled={isPending}
          >
            취소
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? '등록 중...' : '판매 등록'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
