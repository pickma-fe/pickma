'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { useMenuStore } from '@/stores/menuStore';
import { Button } from '@/components/common/Button/Button';
import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { Input } from '@/components/common/Input/Input';
import { Section } from '@/components/common/Section/Section';
import type { MenuItemResponse } from '@/mocks/menus';

interface MenuFormProps {
  initialData?: MenuItemResponse;
  isEdit?: boolean;
}

const menuFormSchema = z.object({
  name: z.string().trim().min(1, '메뉴명을 입력해주세요.'),
  category: z.string().trim().min(1, '카테고리를 선택해주세요.'),
  description: z.string().optional(),
  price: z
    .string()
    .min(1, '가격을 입력해주세요.')
    .refine(
      (value) => Number.isFinite(Number(value)),
      '올바른 가격을 입력해주세요.'
    )
    .refine((value) => Number(value) >= 1, '가격을 입력해주세요.'),
  image: z.string().optional(),
  origin: z.string().optional(),
  allergyInfo: z.string().optional(),
  tags: z.array(z.string()),
});

type MenuFormData = z.infer<typeof menuFormSchema>;

const CATEGORY_OPTIONS = [
  { label: '카테고리를 선택해주세요', value: '' },
  { label: '샌드위치', value: '샌드위치' },
  { label: '샐러드', value: '샐러드' },
  { label: '음료', value: '음료' },
  { label: '디저트', value: '디저트' },
  { label: '스프', value: '스프' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function MenuForm({ initialData, isEdit = false }: MenuFormProps) {
  const router = useRouter();
  const addMenu = useMenuStore((state) => state.addMenu);
  const updateMenu = useMenuStore((state) => state.updateMenu);

  const [tagInput, setTagInput] = useState('');
  const [imageError, setImageError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<MenuFormData>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      category: initialData?.category ?? '',
      description: initialData?.description ?? '',
      price: initialData?.price?.toString() ?? '',
      image: initialData?.image ?? '',
      origin: initialData?.origin ?? '',
      allergyInfo: initialData?.allergyInfo ?? '',
      tags: initialData?.tags ?? [],
    },
  });

  const image = useWatch({ control, name: 'image' });
  const tags = useWatch({ control, name: 'tags' });

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

  const handleAddTag = () => {
    if (tagInput.trim() && !tags?.includes(tagInput.trim())) {
      setValue('tags', [...(tags ?? []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setValue(
      'tags',
      (tags ?? []).filter((t) => t !== tag)
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmit = (data: MenuFormData) => {
    const menuData = {
      name: data.name,
      category: data.category,
      description: data.description ?? '',
      price: Number(data.price),
      image: data.image ?? '',
      origin: data.origin ?? '',
      allergyInfo: data.allergyInfo ?? '',
      tags: data.tags ?? [],
      storeId: initialData?.storeId ?? 'store_1',
      status: 'active' as const,
    };

    if (isEdit && initialData) {
      updateMenu(initialData.id, menuData);
    } else {
      addMenu(menuData);
    }

    router.push('/seller/menu');
  };

  const handleCancel = () => {
    router.push('/seller/menu');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section variant="card" className="bg-white">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            기본 정보
          </h2>
          <div className="flex flex-col gap-4">
            <Input
              label="메뉴명 *"
              placeholder="메뉴명을 입력해주세요"
              {...register('name')}
              error={errors.name?.message}
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">카테고리 *</label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    type="select"
                    items={CATEGORY_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="카테고리를 선택해주세요"
                  />
                )}
              />
              {errors.category && (
                <p className="text-sm text-red-500">
                  {errors.category.message}
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
              label="가격 *"
              type="number"
              placeholder="가격을 입력해주세요"
              {...register('price')}
              error={errors.price?.message}
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

      <Section variant="card" className="bg-white">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">추가 정보</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Input
            label="원산지"
            placeholder="원산지를 입력해주세요 (선택사항)"
            {...register('origin')}
          />
          <Input
            label="알레르기 정보"
            placeholder="알레르기 정보를 입력해주세요 (선택사항)"
            {...register('allergyInfo')}
          />
        </div>
      </Section>

      <Section variant="card" className="bg-white">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          태그 (선택사항)
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              placeholder="태그를 입력하고 Enter를 눌러주세요"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
            <Button variant="outline" color="gray" onClick={handleAddTag}>
              추가
            </Button>
          </div>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400">예: 인기, 시즌메뉴, 추천</p>
        </div>
      </Section>
      <div className="flex justify-end gap-3">
        <Button variant="outline" color="gray" onClick={handleCancel}>
          취소
        </Button>
        <Button onClick={handleSubmit(onSubmit)}>
          {isEdit ? '메뉴 수정' : '메뉴 등록'}
        </Button>
      </div>
    </div>
  );
}
