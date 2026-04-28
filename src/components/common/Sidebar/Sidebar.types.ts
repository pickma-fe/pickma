type SidebarBaseItem = {
  id: string;
  label: string;
  href?: string;
  icon?: React.ElementType;
  disabled?: boolean;
  activeMatch?: (pathname: string) => boolean;
};

export type SidebarChildItem = SidebarBaseItem;

export type SidebarItem = SidebarBaseItem & {
  children?: SidebarChildItem[];
};

export type SidebarSection = {
  id: string;
  title?: string;
  items: SidebarItem[];
};
