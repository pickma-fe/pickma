'use client';

import {
  CalendarCheck,
  CircleHelp,
  Megaphone,
  MessageCircle,
  Settings,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type MypageSidebarView = 'profile' | 'reservations';

interface SidebarItem {
  id: 'reservations' | 'profile' | 'settings' | 'faq' | 'inquiry' | 'notice';
  label: string;
  icon: ReactNode;
  href?: string;
}

const menuItems: SidebarItem[] = [
  {
    id: 'profile',
    label: '내 정보',
    icon: <User className="size-5" aria-hidden="true" />,
    href: '/mypage',
  },
  {
    id: 'reservations',
    label: '내 예약',
    icon: <CalendarCheck className="size-5" aria-hidden="true" />,
    href: '/mypage?view=reservations',
  },
  {
    id: 'settings',
    label: '설정',
    icon: <Settings className="size-5" aria-hidden="true" />,
  },
];

const supportItems: SidebarItem[] = [
  {
    id: 'faq',
    label: '자주 묻는 질문',
    icon: <CircleHelp className="size-5" aria-hidden="true" />,
  },
  {
    id: 'inquiry',
    label: '1:1 문의',
    icon: <MessageCircle className="size-5" aria-hidden="true" />,
  },
  {
    id: 'notice',
    label: '공지사항',
    icon: <Megaphone className="size-5" aria-hidden="true" />,
  },
];

function isActiveItem(
  item: SidebarItem,
  pathname: string,
  activeView: MypageSidebarView
): boolean {
  if (item.id === 'profile') {
    return (
      activeView === 'profile' &&
      (pathname === '/mypage' || pathname === '/mypage/profile')
    );
  }

  if (item.id === 'reservations') {
    return activeView === 'reservations' && pathname === '/mypage';
  }

  return Boolean(item.href && pathname === item.href);
}

function getItemClassName(isActive: boolean, isDisabled: boolean) {
  return [
    'flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-base font-semibold transition focus-visible:ring-primary-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
    isActive ? 'bg-primary-50 text-primary-500' : '',
    !isActive && !isDisabled ? 'text-gray-700 hover:bg-gray-50' : '',
    isDisabled ? 'cursor-not-allowed text-gray-400' : '',
  ].join(' ');
}

function SidebarMenuItem({
  item,
  activeView,
}: {
  item: SidebarItem;
  activeView: MypageSidebarView;
}) {
  const pathname = usePathname();
  const isActive = isActiveItem(item, pathname, activeView);
  const className = getItemClassName(isActive, !item.href);

  if (item.href) {
    return (
      <Link
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        className={className}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <button type="button" disabled aria-disabled="true" className={className}>
      {item.icon}
      <span>{item.label}</span>
    </button>
  );
}

interface MypageSidebarProps {
  activeView?: MypageSidebarView;
}

export function MypageSidebar({ activeView = 'profile' }: MypageSidebarProps) {
  return (
    <aside className="hidden border-r border-gray-200 px-10 py-10 lg:block">
      <h2 className="text-lg font-bold text-gray-900">마이페이지</h2>

      <nav className="mt-6 space-y-2" aria-label="마이페이지 메뉴">
        {menuItems.map((item) => (
          <SidebarMenuItem
            key={item.label}
            item={item}
            activeView={activeView}
          />
        ))}
      </nav>

      <div className="mt-8 border-t border-gray-200 pt-8">
        <p className="text-base font-bold text-gray-900">고객센터</p>
        <nav className="mt-4 space-y-2" aria-label="고객센터 메뉴">
          {supportItems.map((item) => (
            <SidebarMenuItem
              key={item.label}
              item={item}
              activeView={activeView}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
