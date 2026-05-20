'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

import type { ProductDetail } from '@/types/product';

type ProductDetailTabId = 'detail' | 'review' | 'store';

interface ProductDetailTabsProps {
  product: ProductDetail;
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
  const pickupPlace = product.store.addressDetail
    ? `${product.store.address} ${product.store.addressDetail}`
    : product.store.address;

  return (
    <section className="mx-auto max-w-450 px-6">
      <TabGroup>
        <TabList
          aria-label="상품 상세 정보"
          className="flex gap-10 border-b border-gray-200"
        >
          {productDetailTabs.map((tab) => (
            <Tab
              key={tab.id}
              className={({ selected }) =>
                [
                  'focus-visible:ring-primary-500 rounded-sm border-b-2 px-2 py-4 text-base font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  selected
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-600 hover:text-gray-900',
                ].join(' ')
              }
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          <TabPanel className="focus-visible:ring-primary-500 grid gap-10 rounded-sm py-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 lg:grid-cols-[minmax(0,1fr)_minmax(280px,660px)_minmax(0,1fr)]">
            <div className="space-y-8">
              <section>
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  상품 안내
                </h2>
                <p className="text-sm leading-6 text-gray-700">
                  {product.description ?? '등록된 상품 설명이 없습니다.'}
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  상품 구성
                </h2>
                <ul className="list-inside list-disc space-y-2 text-sm text-gray-700">
                  <li>{product.name}</li>
                </ul>
              </section>
            </div>

            <section className="w-full lg:col-start-2">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                영양 정보
              </h2>
              <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
                상품별 영양 정보는 준비 중입니다.
              </div>
            </section>
          </TabPanel>

          <TabPanel className="focus-visible:ring-primary-500 rounded-sm py-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center">
              <h2 className="text-lg font-bold text-gray-900">리뷰</h2>
              <p className="mt-2 text-sm text-gray-500">
                리뷰 기능은 추후 제공 예정입니다.
              </p>
            </div>
          </TabPanel>

          <TabPanel className="focus-visible:ring-primary-500 rounded-sm py-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
            <section>
              <dl className="grid gap-5 md:grid-cols-2">
                <div>
                  <dt className="mb-1 text-base font-bold text-gray-900">
                    매장명
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {product.store.name}
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 text-base font-bold text-gray-900">
                    전화번호
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {product.store.phone}
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 text-base font-bold text-gray-900">
                    지역
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {product.store.region}
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 text-base font-bold text-gray-900">
                    주소
                  </dt>
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
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </section>
  );
}
