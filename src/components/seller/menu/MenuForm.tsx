'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import type { MenuItem } from '@/types/menu-item';
import { useCategories } from '@/hooks/categories/useCategories';
import { useCreateSellerMenuItem } from '@/hooks/seller/menu-items/useCreateSellerMenuItem';
import { useUpdateSellerMenuItem } from '@/hooks/seller/menu-items/useUpdateSellerMenuItem';
import { Button } from '@/components/common/Button/Button';
import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { Input } from '@/components/common/Input/Input';
import { Section } from '@/components/common/Section/Section';

interface MenuFormProps {
  initialData?: MenuItem;
  isEdit?: boolean;
}

const menuFormSchema = z.object({
  categoryId: z.string().min(1, '카테고리를 선택해주세요.'),
  name: z.string().trim().min(1, '메뉴명을 입력해주세요.'),
  description: z.string().optional(),
  originalPrice: z
    .string()
    .min(1, '가격을 입력해주세요.')
    .refine(
      (value) => Number.isFinite(Number(value)),
      '올바른 가격을 입력해주세요.'
    )
    .refine((value) => Number(value) >= 1, '가격을 입력해주세요.'),
  image: z.string().optional(),
});

type MenuFormData = z.infer<typeof menuFormSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function MenuForm({ initialData, isEdit = false }: MenuFormProps) {
  const router = useRouter();
  const { data: categoriesData } = useCategories();
  const { mutate: createMenuItem, isPending: isCreating } =
    useCreateSellerMenuItem();
  const { mutate: updateMenuItem, isPending: isUpdating } =
    useUpdateSellerMenuItem();

  const [imageError, setImageError] = useState('');

  const categoryOptions = [
    { label: '카테고리를 선택해주세요', value: '' },
    ...(categoriesData ?? []).map((c) => ({ label: c.name, value: c.id })),
  ];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<MenuFormData>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      categoryId: initialData?.categoryId ?? '',
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      originalPrice: initialData?.originalPrice?.toString() ?? '',
      image: initialData?.image ?? '',
    },
  });

  const image = useWatch({ control, name: 'image' });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setImageError('이미지 파일은 5MB 이하만 업로드 가능합니다.');
        e.currentTarget.value = '';
        return;
      }
      setImageError('');
      const reader = new FileReader();
      reader.onload = (event) => {
        setValue('image', event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.currentTarget.value = '';
  };

  const handleRemoveImage = () => {
    setValue('image', '');
  };

  const onSubmit = (data: MenuFormData) => {
    const body = {
      categoryId: data.categoryId,
      name: data.name,
      description: data.description || undefined,
      image: data.image || undefined,
      originalPrice: Number(data.originalPrice),
    };

    if (isEdit && initialData) {
      updateMenuItem(
        { id: initialData.id, body },
        { onSuccess: () => router.push('/seller/menu') }
      );
    } else {
      createMenuItem(body, {
        onSuccess: () => router.push('/seller/menu'),
      });
    }
  };

  const handleCancel = () => {
    router.push('/seller/menu');
  };

  const isPending = isCreating || isUpdating;
  const baseLabel = isEdit ? '메뉴 수정' : '메뉴 등록';
  const submitLabel = isPending ? '저장 중...' : baseLabel;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section variant="card" className="bg-white">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            기본 정보
          </h2>
          <div className="flex flex-col gap-4">
            <Input
              label="메뉴명"
              required
              placeholder="메뉴명을 입력해주세요"
              {...register('name')}
              error={errors.name?.message}
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">카테고리 *</label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    type="select"
                    items={categoryOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="카테고리를 선택해주세요"
                  />
                )}
              />
              {errors.categoryId && (
                <p className="text-sm text-red-500">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">메뉴 설명</label>
              <textarea
                placeholder="메뉴에 대한 설명을 입력해주세요 (선택사항)"
                {...register('description')}
                className="focus:border-primary-500 focus:ring-primary-300 h-24 w-full resize-none rounded-md border border-gray-200 px-4 py-2 text-sm outline-none placeholder:text-gray-300 focus:ring-2"
              />
            </div>

            <Input
              label="가격"
              required
              type="number"
              placeholder="가격을 입력해주세요"
              {...register('originalPrice')}
              error={errors.originalPrice?.message}
            />
          </div>
        </Section>

        <Section variant="card" className="bg-white">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            메뉴 이미지
          </h2>
          <div className="flex flex-col gap-4">
            {image ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={image}
                  alt="메뉴 이미지"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                <Upload className="mb-2 h-8 w-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-600">
                  메뉴 이미지를 업로드해주세요
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  권장 사이즈 800x800px / JPG, PNG 파일 / 5MB 이하
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
            {imageError && <p className="text-sm text-red-500">{imageError}</p>}
          </div>
        </Section>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          color="gray"
          onClick={handleCancel}
          disabled={isPending}
        >
          취소
        </Button>
        <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
