'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Menu as HamburgerIcon,
  UserIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { ReactNode } from 'react';

import type { User } from '@/types/user';

import { HamburgerDrawer, type HeaderMenuItem } from './HamburgerDrawer';
import { Button } from '../Button/Button';
import Logo from '../Logo/Logo';

interface HeaderProps {
  user: User | null;
  logoHref?: string;
  menuItems?: HeaderMenuItem[];
  slot?: ReactNode;
}

export function Header({ user, logoHref, menuItems, slot }: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <header className="w-full border-b border-gray-200">
      <div className="mx-auto grid max-w-360 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-6 lg:px-12">
        {logoHref ? (
          <Link href={logoHref} aria-label="홈으로 이동" className="shrink-0">
            <Logo
              iconClassName="h-8 w-8 lg:h-12 lg:w-12"
              textClassName="text-primary-600 text-xl font-bold lg:text-3xl"
            />
          </Link>
        ) : (
          <Logo
            iconClassName="h-8 w-8 lg:h-12 lg:w-12"
            textClassName="text-primary-600 text-xl font-bold lg:text-3xl"
          />
        )}
        <div className="flex min-w-0 justify-center">{slot}</div>
        <div className="shrink-0">
          {/* 데스크탑 메뉴 */}
          <div className="hidden lg:block">
            <RightSection user={user} menuItems={menuItems} />
          </div>
          {/* 모바일 햄버거 */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="메뉴 열기"
            className="focus-visible:ring-primary-500 flex h-11 w-11 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 lg:hidden"
          >
            <HamburgerIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <HamburgerDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          user={user}
          menuItems={menuItems ?? []}
        />
      </div>
    </header>
  );
}

function RightSection({
  user,
  menuItems,
}: Omit<HeaderProps, 'slot' | 'logoHref'>) {
  if (user) {
    return <UserMenu user={user} menuItems={menuItems || []} />;
  } else {
    return <GuestMenu menuItems={menuItems || []} />;
  }
}

function GuestMenu({ menuItems }: { menuItems: HeaderMenuItem[] }) {
  return (
    <div className="flex shrink-0 space-x-1">
      {menuItems.map((item) =>
        item.type === 'action' ? (
          <Button
            key={item.label}
            variant="ghost"
            className={`gap-2 rounded ${item.className || ''}`}
            onClick={item.onClick}
          >
            {item.icon}
            <span>{item.label}</span>
          </Button>
        ) : (
          <Link
            key={item.label}
            href={item.href}
            className={`inline-flex items-center gap-2 rounded px-4 py-2 font-bold text-gray-500 transition ${item.className || ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        )
      )}
    </div>
  );
}

function UserMenu({
  user,
  menuItems,
}: {
  user: User;
  menuItems: HeaderMenuItem[];
}) {
  if (menuItems.length === 0) {
    return (
      <span className="flex items-center gap-2 px-4 py-2">
        <ProfileAvatar user={user} />
        {user.name}
      </span>
    );
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="group focus-visible:ring-primary-500 flex items-center gap-2 rounded-sm px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
        <ProfileAvatar user={user} />
        {user.name}
        <ChevronDownIcon
          aria-hidden="true"
          focusable="false"
          className="h-4 w-4 group-data-open:hidden"
        />
        <ChevronUpIcon
          aria-hidden="true"
          focusable="false"
          className="hidden h-4 w-4 group-data-open:block"
        />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        className="z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white p-1 shadow-lg focus:outline-none"
      >
        {menuItems.map((item) =>
          item.type === 'link' ? (
            <MenuItem
              key={item.label}
              as={Link}
              href={item.href}
              className={`block rounded px-3 py-2 text-sm text-gray-700 data-focus:bg-gray-100 ${item.className || ''}`}
            >
              {item.label}
            </MenuItem>
          ) : (
            <MenuItem
              key={item.label}
              as="button"
              type="button"
              onClick={item.onClick}
              className={`block w-full rounded px-3 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 ${item.className || ''}`}
            >
              {item.label}
            </MenuItem>
          )
        )}
      </MenuItems>
    </Menu>
  );
}

function ProfileAvatar({ user }: { user: User }) {
  return (
    <div className="bg-primary-100 relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
      {user.profileImage ? (
        <Image
          src={user.profileImage}
          alt=""
          fill
          sizes="32px"
          className="object-cover"
        />
      ) : (
        <UserIcon className="text-primary-500 h-6 w-6" strokeWidth={1.5} />
      )}
    </div>
  );
}
