'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon, UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { User } from '@/types/auth';

import { Button } from '../Button/Button';
import Logo from '../Logo/Logo';

type HeaderMenuItem =
  | {
      label: string;
      type: 'link';
      href: string;
      className?: string;
    }
  | {
      label: string;
      type: 'action';
      onClick: () => void;
      className?: string;
    };

interface HeaderProps {
  user: User | null;
  logoHref?: string;
  menuItems?: HeaderMenuItem[];
  slot?: React.ReactNode;
}

export function Header({ user, logoHref, menuItems, slot }: HeaderProps) {
  return (
    <header className="grid w-full grid-cols-[auto_1fr_auto] items-center border-b border-gray-200 px-12 py-4">
      {logoHref ? (
        <Link href={logoHref} aria-label="홈으로 이동">
          <Logo />
        </Link>
      ) : (
        <Logo />
      )}
      <div className="flex justify-center">{slot}</div>
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
    <div className="flex space-x-1">
      {menuItems.map((item) =>
        item.type === 'action' ? (
          <Button
            key={item.label}
            variant="ghost"
            className={`rounded ${item.className || ''}`}
            onClick={item.onClick}
          >
            {item.label}
          </Button>
        ) : (
          <Link
            key={item.label}
            href={item.href}
            className={`text-primary-500 hover:bg-primary-50 rounded px-4 py-2 transition ${item.className || ''}`}
          >
            {item.label}
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
        <MenuItems className="absolute right-0 mt-2 w-48 rounded border border-gray-200 bg-white shadow-lg focus:outline-none">
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
      {user.profileImageUrl ? (
        <Image
          src={user.profileImageUrl}
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
