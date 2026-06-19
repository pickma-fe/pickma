'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import type { Product } from '@/types/product';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { TimePicker } from '@/components/common/TimePicker/TimePicker';

const productEditFormSchema = z.object({
  discountPrice: z
    .string()
    .min(1, '판매가를 입력해주세요.')
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) >= 0,
      '올바른 판매가를 입력해주세요.'
    ),
  stock: z
    .string()
    .min(1, '재고를 입력해주세요.')
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) >= 0,
      '올바른 재고를 입력해주세요.'
    ),
  pickupStartTime: z.string().min(1, '픽업 시작 시간을 입력해주세요.'),
  pickupEndTime: z.string().min(1, '픽업 종료 시간을 입력해주세요.'),
  status: z.enum(['active', 'closed']),
});

export type ProductEditFormData = z.infer<typeof productEditFormSchema>;

interface ProductEditFormProps {
  product: Product;
  isPending: boolean;
  onSubmit: (data: ProductEditFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}

function toTimeValue(timeString: string): string {
  return timeString.slice(0, 5);
}

export function ProductEditForm({
  product,
  isPending,
  onSubmit,
  onCancel,
  submitLabel = '수정 완료',
}: ProductEditFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductEditFormData>({
    resolver: zodResolver(productEditFormSchema),
    defaultValues: {
      discountPrice: String(product.discountPrice),
      stock: String(product.stock),
      pickupStartTime: toTimeValue(product.pickupStartTime),
      pickupEndTime: toTimeValue(product.pickupEndTime),
      status: product.status,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      aria-label="상품 수정 폼"
    >
      {/* 메뉴 정보 (읽기 전용) */}
      <fieldset className="rounded-lg border border-gray-200 p-4">
        <legend className="px-1 text-sm font-medium text-gray-700">
          메뉴 정보
        </legend>
        <div className="flex items-center gap-4 pt-2">
          {product.image && (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-500">{product.categoryName}</p>
            <p className="text-xs text-gray-400">
              원가: {product.originalPrice.toLocaleString('ko-KR')}원
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          * 메뉴는 변경할 수 없습니다. 새 상품을 등록하려면 판매 등록을
          이용해주세요.
        </p>
      </fieldset>

      {/* 판매 정보 */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-medium text-gray-700">판매 정보</legend>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <Input
            label="판매가 (원)"
            required
            type="number"
            placeholder="0"
            {...register('discountPrice')}
            error={errors.discountPrice?.message}
            disabled={isPending}
          />
          <Input
            label="재고 (개)"
            required
            type="number"
            placeholder="0"
            {...register('stock')}
            error={errors.stock?.message}
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="pickupStartTime"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="pickupStartTime"
                  className="text-sm text-gray-700"
                >
                  픽업 시작 시간{' '}
                  <span aria-hidden="true" className="text-red-500">
                    *
                  </span>
                </label>
                <TimePicker
                  id="pickupStartTime"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                  invalid={!!errors.pickupStartTime}
                  describedBy={
                    errors.pickupStartTime ? 'pickupStartTime-error' : undefined
                  }
                />
                {errors.pickupStartTime && (
                  <p
                    id="pickupStartTime-error"
                    className="text-sm text-red-500"
                    role="alert"
                  >
                    {errors.pickupStartTime.message}
                  </p>
                )}
              </div>
            )}
          />
          <Controller
            name="pickupEndTime"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="pickupEndTime"
                  className="text-sm text-gray-700"
                >
                  픽업 종료 시간{' '}
                  <span aria-hidden="true" className="text-red-500">
                    *
                  </span>
                </label>
                <TimePicker
                  id="pickupEndTime"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                  invalid={!!errors.pickupEndTime}
                  describedBy={
                    errors.pickupEndTime ? 'pickupEndTime-error' : undefined
                  }
                />
                {errors.pickupEndTime && (
                  <p
                    id="pickupEndTime-error"
                    className="text-sm text-red-500"
                    role="alert"
                  >
                    {errors.pickupEndTime.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </fieldset>

      {/* 판매 상태 */}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-gray-700">판매 상태</legend>
        <div className="flex gap-4 pt-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              value="active"
              {...register('status')}
              disabled={isPending}
              className="accent-primary-500"
            />
            <span className="text-sm text-gray-700">판매중</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              value="closed"
              {...register('status')}
              disabled={isPending}
              className="accent-primary-500"
            />
            <span className="text-sm text-gray-700">판매중지</span>
          </label>
        </div>
        {errors.status && (
          <p className="text-sm text-red-500" role="alert">
            {errors.status.message}
          </p>
        )}
      </fieldset>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          color="gray"
          onClick={onCancel}
          disabled={isPending}
        >
          취소
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? '저장 중...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
