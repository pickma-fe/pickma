'use client';

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface SelectDropdownItem {
  label: string;
  value: string;
  disabled?: boolean;
}

interface ActionDropdownItem {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface BaseDropdownProps {
  disabled?: boolean;
}

interface SelectDropdownProps extends BaseDropdownProps {
  type: 'select';
  placeholder?: string;
  items: SelectDropdownItem[];
  value: string | undefined;
  onChange: (value: string) => void;
}

interface ActionDropdownProps extends BaseDropdownProps {
  type: 'action';
  label: string;
  items: ActionDropdownItem[];
}

type DropdownProps = SelectDropdownProps | ActionDropdownProps;

const TRIGGER_CLASS_NAME =
  'group headlessui-focus-visible:outline-none headlessui-focus-visible:ring-2 headlessui-focus-visible:ring-offset-2 inline-flex items-center justify-center gap-2 rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400';

const DROPDOWN_ITEMS_CLASS_NAME =
  'z-10 mt-2 min-w-(--button-width) w-max rounded-md border border-gray-200 bg-white p-1 shadow-lg focus:outline-none';

const DROPDOWN_ITEM_CLASS_NAME =
  'block w-full whitespace-nowrap rounded px-3 py-2 text-left text-sm text-gray-700 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus:bg-gray-100';

export function Dropdown(props: DropdownProps) {
  if (props.type === 'select') {
    return <SelectDropdown {...props} />;
  }

  return <ActionDropdown {...props} />;
}

function SelectDropdown(props: SelectDropdownProps) {
  const buttonLabel =
    props.items.find((item) => item.value === props.value)?.label ??
    props.placeholder ??
    '선택';

  return (
    <Listbox
      value={props.value}
      disabled={props.disabled}
      onChange={props.onChange}
      as="div"
      className="relative inline-block text-left"
    >
      <ListboxButton className={TRIGGER_CLASS_NAME}>
        <span>{buttonLabel}</span>
        <DropdownChevron />
      </ListboxButton>

      <ListboxOptions
        anchor="bottom start"
        className={DROPDOWN_ITEMS_CLASS_NAME}
      >
        {props.items.map((item) => (
          <ListboxOption
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={`${DROPDOWN_ITEM_CLASS_NAME} data-selected:font-semibold data-selected:text-gray-900`}
          >
            {item.label}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}

function ActionDropdown(props: ActionDropdownProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton disabled={props.disabled} className={TRIGGER_CLASS_NAME}>
        <span>{props.label}</span>
        <DropdownChevron />
      </MenuButton>

      <MenuItems anchor="bottom start" className={DROPDOWN_ITEMS_CLASS_NAME}>
        {props.items.map((item) => (
          <MenuItem key={item.id} disabled={item.disabled}>
            <button
              type="button"
              disabled={item.disabled}
              onClick={item.onClick}
              className={DROPDOWN_ITEM_CLASS_NAME}
            >
              {item.label}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}

function DropdownChevron() {
  return (
    <>
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
    </>
  );
}
