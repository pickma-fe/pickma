'use client';

import { useRef, useState, type KeyboardEvent } from 'react';

import type { ProductDetailResponse } from '@/contracts/product';

type ProductDetailTabId = 'detail' | 'review' | 'store';

interface ProductDetailTabsProps {
  product: ProductDetailResponse;
}

interface ProductDetailTab {
  id: ProductDetailTabId;
  label: string;
}

const productDetailTabs: ProductDetailTab[] = [
  { id: 'detail', label: '상세정보' },
  { id: 'review', label: '리뷰' },
  { id: 'store', label: '매장 정보' },
];

export function ProductDetailTabs({ product }: ProductDetailTabsProps) {
  const [selectedTabId, setSelectedTabId] =
    useState<ProductDetailTabId>('detail');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedTabIndex = productDetailTabs.findIndex(
    (tab) => tab.id === selectedTabId
  );

  const pickupPlace = product.store.addressDetail
    ? `${product.store.address} ${product.store.addressDetail}`
    : product.store.address;

  const selectTabByIndex = (index: number) => {
    const nextTab = productDetailTabs[index];

    if (!nextTab) {
      return;
    }

    setSelectedTabId(nextTab.id);
    tabRefs.current[index]?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const lastTabIndex = productDetailTabs.length - 1;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectTabByIndex(
        selectedTabIndex === lastTabIndex ? 0 : selectedTabIndex + 1
      );
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectTabByIndex(
        selectedTabIndex === 0 ? lastTabIndex : selectedTabIndex - 1
      );
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      selectTabByIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      selectTabByIndex(lastTabIndex);
    }
  };

  return (
    <section className="mx-auto max-w-450 px-6">
      <div className="border-b border-gray-200">
        <nav className="flex gap-10" role="tablist" aria-label="상품 상세 정보">
          {productDetailTabs.map((tab, index) => {
            const isSelected = selectedTabId === tab.id;

            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                id={`product-detail-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`product-detail-panel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                className={[
                  'border-b-2 px-2 py-4 text-base font-semibold transition',
                  isSelected
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-600 hover:text-gray-900',
                ].join(' ')}
                onClick={() => setSelectedTabId(tab.id)}
                onKeyDown={handleTabKeyDown}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div
        id="product-detail-panel-detail"
        role="tabpanel"
        aria-labelledby="product-detail-tab-detail"
        tabIndex={0}
        hidden={selectedTabId !== 'detail'}
        className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,660px)_minmax(0,1fr)]"
      >
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-bold text-gray-900">상품 안내</h2>
            <p className="text-sm leading-6 text-gray-700">
              {product.description ?? '등록된 상품 설명이 없습니다.'}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-gray-900">상품 구성</h2>
            <ul className="list-inside list-disc space-y-2 text-sm text-gray-700">
              <li>{product.name}</li>
            </ul>
          </section>
        </div>

        <section className="w-full lg:col-start-2">
          <h2 className="mb-4 text-lg font-bold text-gray-900">영양 정보</h2>
          <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
            상품별 영양 정보는 준비 중입니다.
          </div>
        </section>
      </div>

      <div
        id="product-detail-panel-review"
        role="tabpanel"
        aria-labelledby="product-detail-tab-review"
        tabIndex={0}
        hidden={selectedTabId !== 'review'}
        className="py-8"
      >
        <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center">
          <h2 className="text-lg font-bold text-gray-900">리뷰</h2>
          <p className="mt-2 text-sm text-gray-500">
            리뷰 기능은 추후 제공 예정입니다.
          </p>
        </div>
      </div>

      <div
        id="product-detail-panel-store"
        role="tabpanel"
        aria-labelledby="product-detail-tab-store"
        tabIndex={0}
        hidden={selectedTabId !== 'store'}
        className="py-8"
      >
        <section>
          <dl className="grid gap-5 md:grid-cols-2">
            <div>
              <dt className="mb-1 text-base font-bold text-gray-900">매장명</dt>
              <dd className="text-sm text-gray-900">{product.store.name}</dd>
            </div>
            <div>
              <dt className="mb-1 text-base font-bold text-gray-900">
                전화번호
              </dt>
              <dd className="text-sm text-gray-900">{product.store.phone}</dd>
            </div>
            <div>
              <dt className="mb-1 text-base font-bold text-gray-900">지역</dt>
              <dd className="text-sm text-gray-900">{product.store.region}</dd>
            </div>
            <div>
              <dt className="mb-1 text-base font-bold text-gray-900">주소</dt>
              <dd className="text-sm text-gray-900">{pickupPlace}</dd>
            </div>
            {product.store.description ? (
              <div className="md:col-span-2">
                <dt className="mb-1 text-base font-bold text-gray-900">
                  매장 소개
                </dt>
                <dd className="text-sm text-gray-900">
                  {product.store.description}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      </div>
    </section>
  );
}
