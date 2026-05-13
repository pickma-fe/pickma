'use client';

import { useEffect, useRef, useState } from 'react';

import type { UserResponse } from '@/contracts/user';
import { authApi } from '@/api/auth/authApi';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthModal } from '@/components/auth/useAuthModal';
import { Button } from '@/components/common';

// ──────────────────────────────────────────────
// 공통 타입 / 유틸
// ──────────────────────────────────────────────

type RawJson = Record<string, unknown>;

interface ApiSuccessUser {
  statusCode: number;
  data: UserResponse;
}

interface ApiError {
  statusCode: number;
  error: { code: string; message: string };
}

type AuthResult = ApiSuccessUser | ApiError;

function isAuthSuccess(result: AuthResult): result is ApiSuccessUser {
  return 'data' in result;
}

function defaultPickupAt(): string {
  const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

function defaultEndAt(): string {
  const d = new Date(Date.now() + 6 * 60 * 60 * 1000);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

function LoginStatus({ result }: { result: AuthResult | null }) {
  if (!result) return <span className="text-gray-400">미확인</span>;
  if (isAuthSuccess(result)) {
    const { role, status } = result.data;
    return (
      <span className="text-green-600">
        로그인됨 ({role} / {status})
      </span>
    );
  }
  const code = result.error.code;
  if (code === 'UNAUTHORIZED') return <span className="text-red-500">비로그인</span>;
  if (code === 'FORBIDDEN') return <span className="text-orange-500">접근 제한 (suspended)</span>;
  return <span className="text-red-500">{code}</span>;
}

function JsonBlock({ label, result }: { label: string; result: RawJson | null }) {
  if (!result) return null;
  const statusCode =
    typeof result.statusCode === 'number' ? result.statusCode : 500;
  const ok = !('error' in result) && statusCode >= 200 && statusCode < 300;
  return (
    <div className="rounded border p-4 text-sm">
      <p className="mb-2 font-semibold">
        {label}:{' '}
        <span className={ok ? 'text-green-600' : 'text-red-500'}>
          {ok ? `${statusCode} OK` : `${statusCode} 오류`}
        </span>
      </p>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-gray-700">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

// ──────────────────────────────────────────────
// 메인 페이지
// ──────────────────────────────────────────────

export default function DevTestPage() {
  const { isOpen, openAuthModal } = useAuthModal();
  const [meResult, setMeResult] = useState<AuthResult | null>(null);
  const [meLoading, setMeLoading] = useState(false);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    void fetchMe();
  }, []);

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      void fetchMe();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  async function fetchMe() {
    setMeLoading(true);
    try {
      const res = await fetch('/api/users/me');
      setMeResult((await res.json()) as AuthResult);
    } finally {
      setMeLoading(false);
    }
  }

  async function handleSignOut() {
    await authApi.signOut();
    setMeResult(null);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-8">
      <h1 className="text-xl font-bold">Dev Test — API Flows</h1>

      {/* 로그인 상태 */}
      <div className="rounded bg-gray-50 p-4 text-sm">
        <p className="mb-3">
          로그인 상태: <strong><LoginStatus result={meResult} /></strong>
        </p>
        <div className="flex gap-2">
          <Button color="primary" onClick={() => openAuthModal('login', '/dev-test')}>
            로그인
          </Button>
          <Button variant="outline" color="gray" onClick={() => void handleSignOut()}>
            로그아웃
          </Button>
          <Button
            variant="outline"
            color="gray"
            onClick={() => void fetchMe()}
            disabled={meLoading}
          >
            {meLoading ? '조회 중...' : '상태 갱신'}
          </Button>
        </div>
      </div>

      <AuthModal />

      <hr />

      {/* GET /api/orders */}
      <OrdersGetSection />

      <hr />

      {/* GET /api/orders/:orderId */}
      <OrderDetailSection />

      <hr />

      {/* POST /api/orders */}
      <OrdersPostSection />

      <hr />

      {/* Seller Product CRUD */}
      <SellerProductsSection />

      <hr />

      {/* POST /api/payments/prepare */}
      <PaymentPrepareSection />

      <hr />

      {/* POST /api/payments/confirm */}
      <PaymentConfirmSection />
    </div>
  );
}

// ──────────────────────────────────────────────
// Seller Product CRUD
// ──────────────────────────────────────────────

function SellerProductsSection() {
  const [menuItemId, setMenuItemId] = useState(
    '00000000-0000-4000-8000-000000000041'
  );
  const [productId, setProductId] = useState('');
  const [discountPrice, setDiscountPrice] = useState('7200');
  const [stock, setStock] = useState('8');
  const [endAt, setEndAt] = useState(defaultEndAt);
  const [pickupStartTime, setPickupStartTime] = useState('10:00');
  const [pickupEndTime, setPickupEndTime] = useState('13:30');
  const [result, setResult] = useState<RawJson | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function requestSellerProduct(
    label: string,
    path: string,
    init?: RequestInit
  ) {
    setLoading(label);
    setResult(null);
    try {
      const res = await fetch(path, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });
      setResult((await res.json()) as RawJson);
    } finally {
      setLoading(null);
    }
  }

  async function handleGet() {
    await requestSellerProduct('GET', '/api/seller/products');
  }

  async function handleCreate() {
    await requestSellerProduct('POST', '/api/seller/products', {
      method: 'POST',
      body: JSON.stringify({
        menuItemId,
        discountPrice: Number(discountPrice),
        stock: Number(stock),
        endAt: new Date(endAt).toISOString(),
        pickupStartTime,
        pickupEndTime,
      }),
    });
  }

  async function handleUpdate() {
    if (!productId.trim()) return;
    await requestSellerProduct(
      'PATCH',
      `/api/seller/products/${productId.trim()}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          discountPrice: Number(discountPrice),
          stock: Number(stock),
          endAt: new Date(endAt).toISOString(),
          pickupStartTime,
          pickupEndTime,
        }),
      }
    );
  }

  async function handleDelete() {
    if (!productId.trim()) return;
    await requestSellerProduct(
      'DELETE',
      `/api/seller/products/${productId.trim()}`,
      { method: 'DELETE' }
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Seller Product API</h2>

      <div className="rounded bg-blue-50 p-3 text-xs text-blue-800">
        <p className="mb-1 font-semibold">수동 검증 준비</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>로그인 가능한 seller user를 만들고 seed approved store <code>00000000-0000-4000-8000-000000000031</code>의 user_id를 연결</li>
          <li>seed menu item <code>00000000-0000-4000-8000-000000000041</code> 또는 <code>00000000-0000-4000-8000-000000000042</code>로 POST 검증</li>
          <li>미로그인 → <code>401 UNAUTHORIZED</code></li>
          <li>customer/admin 또는 inactive user → <code>403 FORBIDDEN</code></li>
          <li>미승인 seller store → <code>403 STORE_NOT_APPROVED</code></li>
          <li>타 store product 수정/삭제 → <code>404 PRODUCT_NOT_FOUND</code></li>
          <li>빈 PATCH body, 잘못된 time string, 예약 수량보다 작은 stock → <code>400 VALIDATION_ERROR</code></li>
        </ul>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            menuItemId
          </label>
          <input
            type="text"
            value={menuItemId}
            onChange={(e) => setMenuItemId(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            productId (PATCH/DELETE)
          </label>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="POST 성공 후 생성된 product id"
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              discountPrice
            </label>
            <input
              type="number"
              value={discountPrice}
              min="0"
              onChange={(e) => setDiscountPrice(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              stock
            </label>
            <input
              type="number"
              value={stock}
              min="0"
              onChange={(e) => setStock(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            endAt (로컬 시각)
          </label>
          <input
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              pickupStartTime
            </label>
            <input
              type="text"
              value={pickupStartTime}
              onChange={(e) => setPickupStartTime(e.target.value)}
              placeholder="10:00"
              className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              pickupEndTime
            </label>
            <input
              type="text"
              value={pickupEndTime}
              onChange={(e) => setPickupEndTime(e.target.value)}
              placeholder="13:30:00"
              className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          color="primary"
          onClick={() => void handleGet()}
          disabled={loading !== null}
        >
          {loading === 'GET' ? '조회 중...' : 'GET'}
        </Button>
        <Button
          color="primary"
          onClick={() => void handleCreate()}
          disabled={loading !== null}
        >
          {loading === 'POST' ? '등록 중...' : 'POST'}
        </Button>
        <Button
          variant="outline"
          color="gray"
          onClick={() => void handleUpdate()}
          disabled={loading !== null || !productId.trim()}
        >
          {loading === 'PATCH' ? '수정 중...' : 'PATCH'}
        </Button>
        <Button
          variant="outline"
          color="gray"
          onClick={() => void handleDelete()}
          disabled={loading !== null || !productId.trim()}
        >
          {loading === 'DELETE' ? '삭제 중...' : 'DELETE'}
        </Button>
      </div>

      <JsonBlock label="Seller Product API" result={result} />
    </div>
  );
}

// ──────────────────────────────────────────────
// 결제 흐름 안내
// ──────────────────────────────────────────────
// 1. POST /api/orders → orderNumber 획득
// 2. POST /api/payments/prepare (provider=toss) → redirectUrl 확인
// 3. GET  /api/payments/mock/checkout?orderNumber=... (브라우저에서 직접)
// 4. POST /api/payments/confirm (provider+orderNumber+amount)
// 5. GET  /api/orders/:orderId → data.payment 필드 확인

// ──────────────────────────────────────────────
// GET /api/orders
// ──────────────────────────────────────────────

const ORDER_STATUS_OPTIONS = [
  { value: '', label: '전체 (필터 없음)' },
  { value: 'payment_pending', label: 'payment_pending' },
  { value: 'reserved', label: 'reserved' },
  { value: 'ready', label: 'ready' },
  { value: 'completed', label: 'completed' },
  { value: 'cancelled', label: 'cancelled' },
  { value: 'no_show', label: 'no_show' },
  { value: 'expired', label: 'expired' },
] as const;

function OrdersGetSection() {
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [result, setResult] = useState<RawJson | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFetch() {
    setLoading(true);
    setResult(null);
    try {
      const params = new URLSearchParams({ sort, order });
      if (status) params.set('status', status);
      const res = await fetch(`/api/orders?${params.toString()}`);
      setResult((await res.json()) as RawJson);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">GET /api/orders</h2>

      <div className="rounded bg-blue-50 p-3 text-xs text-blue-800">
        <p className="mb-1 font-semibold">검증 항목</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>로그인 + 기본 → <code>200</code> + items 배열, 본인 주문만</li>
          <li>status 필터 선택 → items가 모두 해당 status</li>
          <li>sort=pickupAt + order=asc → pickupAt 오름차순</li>
          <li>미로그인 → <code>401 UNAUTHORIZED</code></li>
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-2 text-xs focus:border-blue-500 focus:outline-none"
          >
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-2 text-xs focus:border-blue-500 focus:outline-none"
          >
            <option value="createdAt">createdAt</option>
            <option value="pickupAt">pickupAt</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">order</label>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-2 text-xs focus:border-blue-500 focus:outline-none"
          >
            <option value="desc">desc</option>
            <option value="asc">asc</option>
          </select>
        </div>
      </div>

      <Button color="primary" onClick={() => void handleFetch()} disabled={loading}>
        {loading ? '조회 중...' : 'GET /api/orders'}
      </Button>

      <JsonBlock label="GET /api/orders" result={result} />
    </div>
  );
}

// ──────────────────────────────────────────────
// GET /api/orders/:orderId
// ──────────────────────────────────────────────

function OrderDetailSection() {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState<RawJson | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFetch() {
    if (!orderId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/orders/${orderId.trim()}`);
      setResult((await res.json()) as RawJson);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">GET /api/orders/:orderId</h2>

      <div className="rounded bg-blue-50 p-3 text-xs text-blue-800">
        <p className="mb-1 font-semibold">검증 항목</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>본인 주문 UUID → <code>200</code> + items 포함, payment 필드 없음</li>
          <li>비UUID (예: <code>not-a-uuid</code>) → <code>400 VALIDATION_ERROR</code>, path: orderId</li>
          <li>존재하지 않는 UUID → <code>404 ORDER_NOT_FOUND</code></li>
          <li>타 사용자 주문 UUID → <code>404 ORDER_NOT_FOUND</code></li>
          <li>미로그인 → <code>401 UNAUTHORIZED</code></li>
        </ul>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          orderId (UUID 또는 임의 문자열)
        </label>
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none"
        />
      </div>

      <Button
        color="primary"
        onClick={() => void handleFetch()}
        disabled={loading || !orderId.trim()}
      >
        {loading ? '조회 중...' : 'GET /api/orders/:orderId'}
      </Button>

      <JsonBlock label="GET /api/orders/:orderId" result={result} />
    </div>
  );
}

// ──────────────────────────────────────────────
// POST /api/orders
// ──────────────────────────────────────────────

function OrdersPostSection() {
  const [productId, setProductId] = useState('f47ac10b-58cc-4372-a567-0e02b2c3d479');
  const [quantity, setQuantity] = useState('1');
  const [pickupAt, setPickupAt] = useState(defaultPickupAt);
  const [result, setResult] = useState<RawJson | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity: Number(quantity),
          pickupAt: new Date(pickupAt).toISOString(),
        }),
      });
      setResult((await res.json()) as RawJson);
    } finally {
      setLoading(false);
    }
  }

  const isSuccess = result !== null && 'data' in result;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">POST /api/orders</h2>

      <div className="rounded bg-blue-50 p-3 text-xs text-blue-800">
        <p className="mb-1 font-semibold">검증 항목 (productId는 항상 UUID 형식 필요)</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>미로그인 + 유효 UUID → <code>401 UNAUTHORIZED</code></li>
          <li>로그인 + 유효 상품 UUID → <code>201</code> + CreateOrderResponse</li>
          <li className="pl-2 text-gray-600">→ Supabase: products.reserved_stock 증가 / orders.status = payment_pending</li>
          <li>존재하지 않는 UUID → <code>404 PRODUCT_NOT_FOUND</code></li>
          <li>재고 없는 상품 → <code>409 OUT_OF_STOCK</code></li>
          <li>만료된 상품 → <code>409 PRODUCT_EXPIRED</code></li>
          <li>픽업 시간 범위 밖 → <code>400 VALIDATION_ERROR</code> (details[0].path = pickupAt)</li>
        </ul>
        <p className="mt-2 text-gray-600">유효 상품 조건: products 테이블에서 expires_at &gt; now(), quantity - reserved_stock &gt; 0, status = active</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            productId (UUID)
          </label>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            quantity
          </label>
          <input
            type="number"
            value={quantity}
            min="1"
            onChange={(e) => setQuantity(e.target.value)}
            className="w-32 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            pickupAt (로컬 시각)
          </label>
          <input
            type="datetime-local"
            value={pickupAt}
            onChange={(e) => setPickupAt(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <Button
        color="primary"
        onClick={() => void handleSubmit()}
        disabled={loading || !productId}
      >
        {loading ? '주문 생성 중...' : 'POST /api/orders'}
      </Button>

      {result && (
        <div className="rounded bg-gray-50 p-3 text-xs text-gray-600">
          <p className="mb-1 font-semibold">요청값 (전송된 ISO)</p>
          <pre className="font-mono">
            {JSON.stringify(
              {
                productId,
                quantity: Number(quantity),
                pickupAt: new Date(pickupAt).toISOString(),
              },
              null,
              2
            )}
          </pre>
        </div>
      )}

      {isSuccess && (
        <div className="rounded bg-green-50 p-3 text-xs text-green-800">
          <p className="mb-1 font-semibold">201 성공 — DB 확인 사항</p>
          <ul className="list-disc space-y-0.5 pl-4">
            <li>orders 테이블: status = payment_pending 행 생성 확인</li>
            <li>order_number = {String((result.data as Record<string, unknown>).orderNumber ?? '')}</li>
            <li>products 테이블: reserved_stock 증가 확인</li>
          </ul>
        </div>
      )}

      <JsonBlock label="POST /api/orders" result={result} />
    </div>
  );
}

// ──────────────────────────────────────────────
// POST /api/payments/prepare
// ──────────────────────────────────────────────

function PaymentPrepareSection() {
  const [provider, setProvider] = useState('toss');
  const [orderNumber, setOrderNumber] = useState('');
  const [result, setResult] = useState<RawJson | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!orderNumber.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/payments/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, orderNumber: orderNumber.trim() }),
      });
      setResult((await res.json()) as RawJson);
    } finally {
      setLoading(false);
    }
  }

  const redirectUrl =
    result && 'data' in result
      ? String((result.data as Record<string, unknown>).redirectUrl ?? '')
      : null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">POST /api/payments/prepare</h2>

      <div className="rounded bg-blue-50 p-3 text-xs text-blue-800">
        <p className="mb-1 font-semibold">검증 항목 (API_MOCK_ENABLED=true 필요)</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>payment_pending 주문 + 로그인 → <code>200</code> + redirectUrl 포함</li>
          <li>redirectUrl(<code>/payment/success?...</code>)을 새 창으로 열면 success 페이지가 confirm API를 자동 호출하고 창을 닫음</li>
          <li>자동 confirm을 건너뛰고 싶으면 아래 수동 confirm 섹션 사용</li>
          <li>존재하지 않는 orderNumber → <code>404 ORDER_NOT_FOUND</code></li>
          <li>미로그인 → <code>401 UNAUTHORIZED</code></li>
        </ul>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-2 text-xs focus:border-blue-500 focus:outline-none"
          >
            <option value="toss">toss</option>
            <option value="kakao_pay">kakao_pay</option>
            <option value="naver_pay">naver_pay</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            orderNumber (POST /api/orders 결과에서 복사)
          </label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="PM2026..."
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <Button
        color="primary"
        onClick={() => void handleSubmit()}
        disabled={loading || !orderNumber.trim()}
      >
        {loading ? '준비 중...' : 'POST /api/payments/prepare'}
      </Button>

      {redirectUrl && (
        <div className="rounded bg-green-50 p-3 text-xs text-green-800">
          <p className="mb-1 font-semibold">200 성공 — redirectUrl</p>
          <a
            href={redirectUrl}
            target="_blank"
            rel="noreferrer"
            className="break-all font-mono underline"
          >
            {redirectUrl}
          </a>
          <p className="mt-2 text-gray-600">→ 링크를 새 창으로 열면 success 페이지가 confirm을 자동 호출함. 수동 confirm은 아래 섹션에서 별도 진행 가능</p>
        </div>
      )}

      <JsonBlock label="POST /api/payments/prepare" result={result} />
    </div>
  );
}

// ──────────────────────────────────────────────
// POST /api/payments/confirm
// ──────────────────────────────────────────────

function PaymentConfirmSection() {
  const [provider, setProvider] = useState('toss');
  const [orderNumber, setOrderNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<RawJson | null>(null);
  const [loading, setLoading] = useState(false);
  const isSuccess =
    result !== null &&
    !('error' in result) &&
    typeof result.statusCode === 'number' &&
    result.statusCode >= 200 &&
    result.statusCode < 300;

  async function handleSubmit() {
    if (!orderNumber.trim() || !amount) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          orderNumber: orderNumber.trim(),
          amount: Number(amount),
        }),
      });
      const json = (await res.json()) as RawJson;
      setResult(json);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">POST /api/payments/confirm</h2>

      <div className="rounded bg-blue-50 p-3 text-xs text-blue-800">
        <p className="mb-1 font-semibold">검증 항목 (API_MOCK_ENABLED=true 필요)</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>올바른 amount → <code>200</code> + DB 확인 (payments 행 생성, orders.status = reserved)</li>
          <li>amount 불일치 → <code>400 PAYMENT_AMOUNT_MISMATCH</code></li>
          <li>존재하지 않는 orderNumber → <code>404 ORDER_NOT_FOUND</code></li>
          <li>미로그인 → <code>401 UNAUTHORIZED</code></li>
          <li>confirm 후 GET /api/orders/:orderId → payment 필드 포함 확인</li>
        </ul>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-2 text-xs focus:border-blue-500 focus:outline-none"
          >
            <option value="toss">toss</option>
            <option value="kakao_pay">kakao_pay</option>
            <option value="naver_pay">naver_pay</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">orderNumber</label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="PM2026..."
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            amount (prepare 응답의 amount 값)
          </label>
          <input
            type="number"
            value={amount}
            min="1"
            onChange={(e) => setAmount(e.target.value)}
            className="w-40 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <Button
        color="primary"
        onClick={() => void handleSubmit()}
        disabled={loading || !orderNumber.trim() || !amount}
      >
        {loading ? '확인 중...' : 'POST /api/payments/confirm'}
      </Button>

      {isSuccess && (
        <div className="rounded bg-green-50 p-3 text-xs text-green-800">
          <p className="font-semibold">200 성공 — DB 확인 사항</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li>payments 테이블: 해당 orderNumber 행 생성 확인</li>
            <li>orders 테이블: status = reserved 전환 확인</li>
            <li>GET /api/orders/:orderId → data.payment 필드 포함 확인</li>
          </ul>
        </div>
      )}

      <JsonBlock label="POST /api/payments/confirm" result={result} />
    </div>
  );
}
