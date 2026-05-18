import {
  CalendarCheck,
  CircleHelp,
  Megaphone,
  MessageCircle,
  Settings,
  User,
} from 'lucide-react';

const menuItems = [
  {
    label: '내 예약',
    icon: <CalendarCheck className="size-5" aria-hidden="true" />,
    active: true,
  },
  {
    label: '내 정보',
    icon: <User className="size-5" aria-hidden="true" />,
    active: false,
  },
  {
    label: '설정',
    icon: <Settings className="size-5" aria-hidden="true" />,
    active: false,
  },
];

const supportItems = [
  {
    label: '자주 묻는 질문',
    icon: <CircleHelp className="size-5" aria-hidden="true" />,
  },
  {
    label: '1:1 문의',
    icon: <MessageCircle className="size-5" aria-hidden="true" />,
  },
  {
    label: '공지사항',
    icon: <Megaphone className="size-5" aria-hidden="true" />,
  },
];

export function MypageSidebar() {
  return (
    <aside className="hidden border-r border-gray-200 px-10 py-10 lg:block">
      <h2 className="text-lg font-bold text-gray-900">마이페이지</h2>

      <nav className="mt-6 space-y-2" aria-label="마이페이지 메뉴">
        {menuItems.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={!item.active}
            className={[
              'flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50',
              item.active
                ? 'bg-primary-50 text-primary-500'
                : 'text-gray-700 hover:bg-gray-50',
            ].join(' ')}
            aria-current={item.active ? 'page' : undefined}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-8 border-t border-gray-200 pt-8">
        <p className="text-base font-bold text-gray-900">고객센터</p>
        <nav className="mt-4 space-y-2" aria-label="고객센터 메뉴">
          {supportItems.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-center gap-3 rounded-md px-4 py-3 text-left text-base font-medium text-gray-700 opacity-50"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
