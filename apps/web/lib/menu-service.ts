import { MenuItem, MenuSection, SidebarConfig } from '@/types/menu';

// 模拟数据库操作 (后续可替换为真实数据库连接)
let menuStorage: MenuItem[] = [];

// 管理员固化菜单配置
const ADMIN_FIXED_SECTIONS: MenuSection[] = [
  {
    id: 'data_management',
    type: 'admin_fixed',
    title: '数据管理',
    orderIndex: 1,
    items: [
      {
        id: 'data_sources',
        title: '数据源',
        url: '/data-sources',
        icon: 'RiDatabase2Line',
        orderIndex: 1,
      }
    ]
  },
  {
    id: 'system_admin',
    type: 'admin_fixed',
    title: '系统管理',
    orderIndex: 2,
    items: [
      {
        id: 'projects',
        title: '项目',
        url: '/projects',
        icon: 'RiFolderLine',
        orderIndex: 1,
      },
      {
        id: 'users',
        title: '用户管理',
        url: '/admin/users',
        icon: 'RiUserLine',
        orderIndex: 2,
      },
      {
        id: 'settings',
        title: '系统设置',
        url: '/admin/settings',
        icon: 'RiSettings3Line',
        orderIndex: 3,
      }
    ]
  }
];

export class MenuService {
  // 获取用户菜单
  static async getUserMenus(userId: string): Promise<MenuItem[]> {
    return menuStorage
      .filter(item => item.userId === userId)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  // 创建菜单项
  static async createMenuItem(data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    const newItem: MenuItem = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    menuStorage.push(newItem);
    return newItem;
  }

  // 更新菜单项
  static async updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem | null> {
    const index = menuStorage.findIndex(item => item.id === id);
    if (index === -1) return null;

    // 创建更新对象，排除 id 字段和 undefined 值
    const updateData: Partial<Omit<MenuItem, 'id'>> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isVisible !== undefined) updateData.isVisible = data.isVisible;
    if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex;
    if (data.parentId !== undefined) updateData.parentId = data.parentId;
    if (data.userId !== undefined) updateData.userId = data.userId;
    if (data.children !== undefined) updateData.children = data.children;
    if (data.createdAt !== undefined) updateData.createdAt = data.createdAt;

    menuStorage[index] = {
      ...menuStorage[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    } as MenuItem;

    return menuStorage[index];
  }

  // 删除菜单项
  static async deleteMenuItem(id: string): Promise<boolean> {
    const index = menuStorage.findIndex(item => item.id === id);
    if (index === -1) return false;

    // 删除子项
    menuStorage = menuStorage.filter(item => item.parentId !== id);
    // 删除自身
    menuStorage.splice(index, 1);
    return true;
  }

  // 批量更新排序
  static async updateMenuOrder(updates: { id: string; orderIndex: number }[]): Promise<boolean> {
    updates.forEach(update => {
      const index = menuStorage.findIndex(item => item.id === update.id);
      if (index !== -1) {
        const menuItem = menuStorage[index];
        if (menuItem) {
          menuItem.orderIndex = update.orderIndex;
          menuItem.updatedAt = new Date().toISOString();
        }
      }
    });
    return true;
  }

  // 构建层次结构
  static buildMenuHierarchy(items: MenuItem[]): MenuItem[] {
    const itemMap = new Map(items.map(item => [item.id, { ...item, children: [] as MenuItem[] }]));
    const roots: MenuItem[] = [];

    items.forEach(item => {
      const menuItem = itemMap.get(item.id)!;
      if (item.parentId && itemMap.has(item.parentId)) {
        const parent = itemMap.get(item.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(menuItem);
      } else {
        roots.push(menuItem);
      }
    });

    // 排序
    const sortItems = (items: MenuItem[]) => {
      items.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      items.forEach(item => {
        if (item.children?.length) {
          sortItems(item.children);
        }
      });
    };

    sortItems(roots);
    return roots;
  }

  // 组织用户菜单为分组结构
  static async organizeUserMenus(userId: string): Promise<MenuSection[]> {
    const userMenus = await this.getUserMenus(userId);
    const hierarchicalMenus = this.buildMenuHierarchy(userMenus);

    // 将顶级项目作为分组，其子项作为菜单项
    const sections: MenuSection[] = hierarchicalMenus
      .filter(item => !item.parentId)
      .map(section => ({
        id: section.id,
        type: 'user_custom' as const,
        title: section.title,
        orderIndex: section.orderIndex,
        isVisible: section.isVisible !== false,
        items: section.children || []
      }));

    return sections;
  }

  // 获取完整侧边栏配置
  static async getSidebarConfig(userId: string, isAdmin: boolean = false): Promise<SidebarConfig> {
    const userSections = await this.organizeUserMenus(userId);

    return {
      userSections,
      adminSections: isAdmin ? ADMIN_FIXED_SECTIONS : []
    };
  }

  // 获取管理员固化菜单
  static getAdminFixedSections(): MenuSection[] {
    return ADMIN_FIXED_SECTIONS;
  }
}
