'use client';

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronDownIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { SidebarSection, SidebarItem } from './Sidebar.types';

type SectionProps = {
  sections: SidebarSection[];
  'aria-label'?: string;
};

export function Sidebar({ sections, 'aria-label': ariaLabel }: SectionProps) {
  const pathname = usePathname() ?? '';

  return (
    <aside className="h-full w-64 border-r border-gray-200 px-5">
      <nav aria-label={ariaLabel ?? '사이드바 내비게이션'}>
        {sections.map((section) => (
          <div key={section.id} className="mb-4">
            {section.title && (
              <p className="mb-2 px-3 text-sm font-semibold text-gray-900">
                {section.title}
              </p>
            )}

            <ul className="space-y-1">
              {section.items.map((item) => (
                <SidebarItemNode
                  key={item.id}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function SidebarItemNode({
  item,
  pathname,
  depth = 0,
}: {
  item: SidebarItem;
  pathname: string;
  depth?: number;
}) {
  const Icon = item.icon;

  const isActiveSelf = getIsActive(item, pathname);

  const isActiveChild =
    item.children?.some((child) => getIsActive(child, pathname)) ?? false;

  const isActive = isActiveSelf || isActiveChild;

  const pl = depth === 0 ? 'pl-3' : 'pl-6';

  if (item.children) {
    return (
      <li>
        <Disclosure key={String(isActive)} defaultOpen={isActive}>
          <DisclosureButton
            disabled={item.disabled}
            className={`group mb-1 flex w-full items-center justify-between rounded-sm py-2 pr-3 text-sm ${!isActive ? 'hover:bg-gray-100' : ''} ${pl} ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-500'} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <div className="flex items-center gap-2 font-medium">
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </div>

            <ChevronDownIcon className="h-4 w-4 transition-transform group-data-open:rotate-180" />
          </DisclosureButton>

          <DisclosurePanel>
            <ul className="space-y-1 pb-1">
              {item.children.map((child) => (
                <SidebarItemNode
                  key={child.id}
                  item={child}
                  pathname={pathname}
                  depth={depth + 1}
                />
              ))}
            </ul>
          </DisclosurePanel>
        </Disclosure>
      </li>
    );
  }

  return (
    <li>
      {item.href && !item.disabled ? (
        <Link
          href={item.href}
          aria-current={isActive ? 'page' : undefined}
          className={`flex items-center gap-2 rounded-sm py-2 pr-3 text-sm ${!isActive ? 'hover:bg-gray-100' : ''} ${pl} ${isActive ? 'bg-primary-100 text-primary-700 font-semibold' : 'font-medium text-gray-500'}`}
        >
          {Icon && <Icon className="h-4 w-4" />}
          {item.label}
        </Link>
      ) : (
        <span
          aria-disabled={item.disabled ? 'true' : undefined}
          className={`flex items-center gap-2 rounded-sm py-2 pr-3 text-sm font-medium ${pl} ${item.disabled ? 'cursor-not-allowed text-gray-500 opacity-50' : 'text-gray-500'}`}
        >
          {Icon && <Icon className="h-4 w-4" />}
          {item.label}
        </span>
      )}
    </li>
  );
}

function getIsActive(item: SidebarItem, pathname: string) {
  if (item.activeMatch) return item.activeMatch(pathname);
  if (item.href) return pathname === item.href;
  return false;
}
