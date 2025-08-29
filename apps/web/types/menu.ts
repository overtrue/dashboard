export interface MenuItem {
  id: string;
  title: string;
  url?: string;
  icon?: string;
  isActive?: boolean;
  isVisible?: boolean;
  orderIndex?: number;
  parentId?: string;
  userId?: string;
  children?: MenuItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuSection {
  id: string;
  type: 'user_custom' | 'admin_fixed';
  title: string;
  isCollapsible?: boolean;
  isVisible?: boolean;
  orderIndex?: number;
  items: MenuItem[];
}

export interface SidebarConfig {
  userSections: MenuSection[];
  adminSections: MenuSection[];
}

export interface MenuFormData {
  title: string;
  url?: string;
  icon?: string;
  parentId?: string;
  orderIndex?: number;
}

export interface MenuUpdateData {
  id: string;
  title?: string;
  url?: string;
  icon?: string;
  parentId?: string;
  orderIndex?: number;
  isVisible?: boolean;
}