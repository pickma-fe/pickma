import Link from 'next/link';

export default function AdminPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">관리자 대시보드</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/stores/pending"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-gray-800">가게 승인</h2>
          <p className="mt-1 text-sm text-gray-500">
            승인 대기 중인 가게를 검토합니다
          </p>
        </Link>
        <Link
          href="/admin/stores"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-gray-800">전체 가게</h2>
          <p className="mt-1 text-sm text-gray-500">
            등록된 모든 가게를 확인합니다
          </p>
        </Link>
      </div>
    </div>
  );
}
