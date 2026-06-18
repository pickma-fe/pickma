'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

interface ActionsMenuProps {
  items: ActionMenuItem[];
  disabled?: boolean;
  'aria-label'?: string;
}

export function ActionsMenu({
  items,
  disabled,
  'aria-label': ariaLabel = '관리 메뉴',
}: ActionsMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        disabled={disabled}
        aria-label={ariaLabel}
        className="rounded p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MoreVertical aria-hidden="true" className="h-4 w-4" />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        className="z-10 mt-1 w-36 rounded-md border border-gray-200 bg-white p-1 shadow-lg focus:outline-none"
      >
        {items.map((item) => (
          <MenuItem key={item.id} disabled={item.disabled}>
            <button
              type="button"
              disabled={item.disabled}
              onClick={item.onClick}
              className={`block w-full rounded px-3 py-2 text-left text-sm whitespace-nowrap data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus:bg-gray-100 ${
                item.variant === 'danger'
                  ? 'text-red-600 data-focus:bg-red-50'
                  : 'text-gray-700'
              }`}
            >
              {item.label}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
