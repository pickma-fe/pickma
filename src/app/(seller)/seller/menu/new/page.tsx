import { MenuForm } from '@/components/seller/menu/MenuForm';

export default function MenuNewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          메뉴 등록
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          새로운 메뉴를 등록하고 고객에게 선보이세요.
        </p>
      </div>

      <MenuForm />
    </div>
  );
}
