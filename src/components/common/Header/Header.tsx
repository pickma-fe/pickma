'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon, UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import type { User } from '@/types/user';

import { Button } from '../Button/Button';
import Logo from '../Logo/Logo';

type HeaderMenuItem =
  | {
      label: string;
      type: 'link';
      href: string;
      icon?: ReactNode;
      className?: string;
    }
  | {
      label: string;
      type: 'action';
      onClick: () => void;
      icon?: ReactNode;
      className?: string;
    };

interface HeaderProps {
  user: User | null;
  logoHref?: string;
  menuItems?: HeaderMenuItem[];
  slot?: ReactNode;
}

export function Header({ user, logoHref, menuItems, slot }: HeaderProps) {
  return (
    <header className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-12">
      {logoHref ? (
        <Link href={logoHref} aria-label="홈으로 이동" className="shrink-0">
          <Logo />
        </Link>
      ) : (
        <Logo />
      )}
      <div className="flex min-w-0 justify-center">{slot}</div>
      <RightSection user={user} menuItems={menuItems} />
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
    <div className="relative">
      <Menu>
        <MenuButton className="group headlessui-focus-visible:ring-2 headlessui-focus-visible:ring-primary-500 headlessui-focus-visible:ring-offset-2 flex items-center gap-2 rounded-sm px-4 py-2 focus:outline-none">
          <ProfileAvatar user={user} />
          {user.name}
          <ChevronDownIcon className="h-4 w-4 group-data-active:hidden" />
          <ChevronUpIcon className="hidden h-4 w-4 group-data-active:block" />
        </MenuButton>
        <MenuItems className="absolute right-0 z-50 mt-2 w-48 rounded border border-gray-200 bg-white shadow-lg focus:outline-none">
          {menuItems.map((item) =>
            item.type === 'link' ? (
              <MenuItem
                key={item.label}
                as={Link}
                href={item.href}
                className={`block px-4 py-2 hover:bg-gray-100 data-focus:bg-gray-100 ${item.className || ''}`}
              >
                {item.label}
              </MenuItem>
            ) : (
              <MenuItem
                key={item.label}
                as="button"
                type="button"
                onClick={item.onClick}
                className={`block w-full px-4 py-2 text-left hover:bg-gray-100 data-focus:bg-gray-100 ${item.className || ''}`}
              >
                {item.label}
              </MenuItem>
            )
          )}
        </MenuItems>
      </Menu>
    </div>
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
