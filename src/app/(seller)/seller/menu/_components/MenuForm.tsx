'use client';

import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

interface MenuFormData {
  name: string;
  category: string;
  description: string;
  price: string;
  image: string | null;
  origin: string;
  allergyInfo: string;
  tags: string[];
}

const CATEGORY_OPTIONS = [
  { label: '카테고리를 선택해주세요', value: '' },
  { label: '샌드위치', value: '샌드위치' },
  { label: '샐러드', value: '샐러드' },
  { label: '음료', value: '음료' },
  { label: '디저트', value: '디저트' },
  { label: '스프', value: '스프' },
];

export function MenuForm({ initialData, isEdit = false }: MenuFormProps) {
  const router = useRouter();
  const { addMenu, updateMenu } = useMenuStore();

  const [formData, setFormData] = useState<MenuFormData>({
    name: initialData?.name ?? '',
    category: initialData?.category ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price?.toString() ?? '',
    image: initialData?.image ?? null,
    origin: initialData?.origin ?? '',
    allergyInfo: initialData?.allergyInfo ?? '',
    tags: initialData?.tags ?? [],
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof MenuFormData, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      handleChange('image', url);
    }
    e.currentTarget.value = '';
  };

  const handleRemoveImage = () => {
    handleChange('image', null);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '메뉴명을 입력해주세요.';
    }
    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }
    if (!formData.description.trim()) {
      newErrors.description = '메뉴 설명을 입력해주세요.';
    }
    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = '가격을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const menuData = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      price: Number(formData.price),
      image: formData.image ?? '',
      origin: formData.origin,
      allergyInfo: formData.allergyInfo,
      tags: formData.tags,
      storeId: 'store-1',
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
        {/* 기본 정보 */}
        <Section variant="card" className="bg-white">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            기본 정보
          </h2>
          <div className="flex flex-col gap-4">
            <Input
              label="메뉴명 *"
              placeholder="메뉴명을 입력해주세요"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">카테고리 *</label>
              <Dropdown
                type="select"
                items={CATEGORY_OPTIONS}
                value={formData.category}
                onChange={(value) => handleChange('category', value)}
                placeholder="카테고리를 선택해주세요"
              />
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">메뉴 설명 *</label>
              <textarea
                placeholder="메뉴에 대한 설명을 입력해주세요"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="focus:border-primary-500 focus:ring-primary-300 h-24 w-full resize-none rounded-md border border-gray-200 px-4 py-2 text-sm outline-none placeholder:text-gray-300 focus:ring-2"
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <Input
              label="가격 *"
              type="number"
              placeholder="가격을 입력해주세요"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              error={errors.price}
            />
          </div>
        </Section>

        {/* 이미지 업로드 */}
        <Section variant="card" className="bg-white">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            메뉴 이미지
          </h2>
          <div className="flex flex-col gap-4">
            {formData.image ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={formData.image}
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
          </div>
        </Section>
      </div>

      {/* 추가 정보 */}
      <Section variant="card" className="bg-white">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">추가 정보</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Input
            label="원산지"
            placeholder="원산지를 입력해주세요 (선택사항)"
            value={formData.origin}
            onChange={(e) => handleChange('origin', e.target.value)}
          />
          <Input
            label="알레르기 정보"
            placeholder="알레르기 정보를 입력해주세요 (선택사항)"
            value={formData.allergyInfo}
            onChange={(e) => handleChange('allergyInfo', e.target.value)}
          />
        </div>
      </Section>

      {/* 태그 */}
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
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
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

      {/* 버튼 */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" color="gray" onClick={handleCancel}>
          취소
        </Button>
        <Button onClick={handleSubmit}>
          {isEdit ? '메뉴 수정' : '메뉴 등록'}
        </Button>
      </div>
    </div>
  );
}
