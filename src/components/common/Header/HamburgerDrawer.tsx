'use client';

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { UserIcon, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import type { User } from '@/types/user';

export type HeaderMenuItem =
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

interface HamburgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  menuItems: HeaderMenuItem[];
}

export function HamburgerDrawer({
  isOpen,
  onClose,
  user,
  menuItems,
}: HamburgerDrawerProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 transition duration-300 ease-out data-closed:opacity-0 motion-reduce:transition-none"
      />
      <DialogPanel
        transition
        className="fixed top-0 right-0 h-full w-72 overflow-y-auto bg-white shadow-xl transition duration-300 ease-out data-closed:translate-x-full motion-reduce:transition-none"
      >
        <DialogTitle className="sr-only">메뉴</DialogTitle>
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          {user ? (
            <div className="flex items-center gap-3">
              <ProfileAvatar user={user} />
              <span className="text-sm font-medium text-gray-900">
                {user.name}
              </span>
            </div>
          ) : (
            <span className="text-sm font-medium text-gray-500">메뉴</span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="focus-visible:ring-primary-500 flex h-11 w-11 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="메뉴">
          <ul className="py-2">
            {menuItems.map((item) =>
              item.type === 'link' ? (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`focus-visible:ring-primary-500 flex min-h-11 items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset ${item.className ?? ''}`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => {
                      item.onClick();
                      onClose();
                    }}
                    className={`focus-visible:ring-primary-500 flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset ${item.className ?? ''}`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              )
            )}
          </ul>
        </nav>
      </DialogPanel>
    </Dialog>
  );
}

function ProfileAvatar({ user }: { user: User }) {
  return (
    <div className="bg-primary-100 relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
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
