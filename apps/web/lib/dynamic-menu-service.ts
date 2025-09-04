import { DynamicPage } from '@/types/dynamic-page'

// 菜单项接口 (与侧边栏的MenuItem接口保持一致)
export interface MenuItem {
  id: string
  title: string
  url?: string
  icon?: string
  isActive?: boolean
  children?: MenuItem[]
  isDynamic?: boolean // 标记是否为动态页面
}

export interface MenuSection {
  id: string
  type: 'user_custom' | 'admin_fixed'
  title: string
  items: MenuItem[]
}

// 动态菜单管理服务
export class DynamicMenuService {

  // 获取完整的菜单数据（静态 + 动态）
  async getMenuData(): Promise<MenuSection[]> {
    const staticMenus = this.getStaticMenus()
    const dynamicPages = await this.getDynamicPages()

    // 将动态页面添加到对应的菜单区域
    const menuData = [...staticMenus]

    dynamicPages.forEach(page => {
      const targetSectionType = this.getMenuSection(page)
      const targetSection = menuData.find(section => section.type === targetSectionType)

      if (targetSection) {
        const dynamicMenuItem: MenuItem = {
          id: `dynamic-${page.id}`,
          title: page.title,
          url: page.path,
          icon: page.icon || 'RiFileLine',
          isDynamic: true
        }

        targetSection.items.push(dynamicMenuItem)
      }
    })

    return menuData
  }

  // 获取静态菜单配置
  private getStaticMenus(): MenuSection[] {
    return [
      {
        id: 'user_custom',
        type: 'user_custom',
        title: 'Sections',
        items: [
          {
            id: 'dashboard',
            title: 'Dashboard',
            url: '#',
            icon: 'RiScanLine',
            children: [
              { id: 'overview', title: 'Overview', url: '/dashboard/overview' },
              { id: 'analytics', title: 'Analytics', url: '/dashboard/analytics' },
              { id: 'reports', title: 'Reports', url: '/dashboard/reports' },
            ]
          },
          {
            id: 'insights',
            title: 'Insights',
            url: '#',
            icon: 'RiBardLine',
            children: [
              { id: 'trends', title: 'Trends', url: '/insights/trends' },
              { id: 'predictions', title: 'Predictions', url: '/insights/predictions' },
            ]
          },
          {
            id: 'contacts',
            title: 'Contacts',
            url: '/contacts',
            icon: 'RiUserFollowLine',
            isActive: true,
          },
          {
            id: 'tools',
            title: 'Tools',
            url: '#',
            icon: 'RiCodeSSlashLine',
            children: [
              { id: 'api', title: 'API Keys', url: '/tools/api' },
              { id: 'webhooks', title: 'Webhooks', url: '/tools/webhooks' },
              { id: 'integrations', title: 'Integrations', url: '/tools/integrations' },
            ]
          },
        ]
      },
      {
        id: 'system_admin',
        type: 'admin_fixed',
        title: '系统管理',
        items: [
          {
            id: 'admin_overview',
            title: '管理概览',
            url: '/admin',
            icon: 'RiScanLine',
          },
          {
            id: 'data_sources',
            title: '数据源',
            url: '/admin/data-sources',
            icon: 'RiDatabase2Line',
          },
          {
            id: 'projects',
            title: '项目',
            url: '/admin/projects',
            icon: 'RiFolderLine',
          },
          {
            id: 'users',
            title: '用户管理',
            url: '/admin/users',
            icon: 'RiUserLine',
          },
          {
            id: 'dynamic_pages',
            title: '页面管理',
            url: '/admin/pages',
            icon: 'RiFileLine',
          },
          {
            id: 'settings',
            title: '系统设置',
            url: '#',
            icon: 'RiSettings3Line',
            children: [
              { id: 'general', title: '常规设置', url: '/admin/settings/general' },
              { id: 'security', title: '安全设置', url: '/admin/settings/security' },
              { id: 'notifications', title: '通知设置', url: '/admin/settings/notifications' },
            ]
          }
        ]
      }
    ]
  }

  // 获取动态页面数据
  private async getDynamicPages(): Promise<DynamicPage[]> {
    try {
      const response = await fetch('/api/dynamic-pages')
      if (response.ok) {
        const pages = await response.json()
        // 只返回需要添加到菜单的页面
        return pages.filter((page: DynamicPage) => page.isPublic !== false)
      }
    } catch (error) {
      console.error('Error fetching dynamic pages:', error)
    }
    return []
  }

  // 根据页面配置确定应该添加到哪个菜单区域
  private getMenuSection(page: DynamicPage): 'user_custom' | 'admin_fixed' {
    // 这里可以基于页面的元数据来判断
    // 暂时简单根据创建者来判断
    if (page.createdBy === 'system' || page.title.includes('管理')) {
      return 'admin_fixed'
    }
    return 'user_custom'
  }

  // 添加动态页面到菜单
  async addPageToMenu(pageId: string, menuSection: 'user_custom' | 'admin_fixed' = 'user_custom') {
    // 这个方法可以用来在保存页面时自动添加到菜单
    // 实际实现中可能需要持久化菜单配置
    console.log(`Adding page ${pageId} to ${menuSection} menu`)
    return true
  }

  // 从菜单移除动态页面
  async removePageFromMenu(pageId: string) {
    console.log(`Removing page ${pageId} from menu`)
    return true
  }
}

// 导出单例实例
export const dynamicMenuService = new DynamicMenuService()
