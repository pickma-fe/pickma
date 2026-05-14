import { PendingStoresClient } from '../../_components/PendingStoresClient';

export default function AdminStoresPendingPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">가게 승인</h1>
      <PendingStoresClient />
    </div>
  );
}
