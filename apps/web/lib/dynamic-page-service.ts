import { ComponentDefinition, DynamicPage, DynamicPageService, PageFormData } from '@/types/dynamic-page'

// 模拟动态页面数据存储
const pageStorage: DynamicPage[] = [
  // 示例页面 - 用户管理
  {
    id: 'example-user-management',
    title: '用户管理示例',
    description: '演示用户列表和管理功能的示例页面',
    icon: 'RiUserLine',
    path: '/dynamic/user-management',
    layout: {
      type: 'single',
      sections: [
        {
          id: 'header',
          type: 'header',
          component: {
            type: 'container',
            props: {
              className: 'flex items-center justify-between gap-4 mb-6'
            },
            children: [
              {
                type: 'text',
                props: {
                  content: '用户管理',
                  variant: 'h1'
                }
              },
              {
                type: 'button',
                props: {
                  text: '新建用户',
                  variant: 'default',
                  icon: 'RiAddLine'
                },
                events: [
                  {
                    type: 'click',
                    action: {
                      type: 'dialog',
                      config: {
                        dialogId: 'create-user-dialog'
                      }
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          id: 'content',
          type: 'content',
          component: {
            type: 'table',
            props: {
              data: '{{users}}',
              columns: [
                { accessorKey: 'email', header: '邮箱' },
                { accessorKey: 'role', header: '角色' },
                { accessorKey: 'createdAt', header: '创建时间' }
              ],
              searchPlaceholder: '搜索用户...',
              emptyMessage: '暂无用户数据'
            },
            dataSource: {
              type: 'api',
              config: {
                url: '/api/users',
                method: 'GET'
              },
              refresh: {
                trigger: 'mount'
              }
            }
          }
        }
      ],
      config: {
        maxWidth: 'container',
        padding: 'large'
      }
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    isPublic: false
  }
]

export class DynamicPageServiceImpl implements DynamicPageService {
  async getPages(): Promise<DynamicPage[]> {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...pageStorage].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  async getPage(id: string): Promise<DynamicPage | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const page = pageStorage.find(p => p.id === id)
    return page ? { ...page } : null
  }

  async savePage(data: PageFormData): Promise<DynamicPage> {
    await new Promise(resolve => setTimeout(resolve, 400))

    // 生成路径
    const path = `/dynamic/${data.title.toLowerCase().replace(/\s+/g, '-')}`

    // 检查路径是否已存在
    const existingPage = pageStorage.find(p => p.path === path)
    if (existingPage) {
      throw new Error('页面路径已存在')
    }

    const newPage: DynamicPage = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      icon: data.icon || 'RiFileLine',
      path: path,
      layout: data.layout,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user', // 实际应用中从认证信息获取
      isPublic: false
    }

    pageStorage.push(newPage)

    // 如果需要添加到菜单，这里可以调用菜单服务
    if (data.addToMenu) {
      // TODO: 实现添加到菜单的逻辑
      console.log('Adding page to menu:', data.menuSection)
    }

    return { ...newPage }
  }

  async updatePage(id: string, data: Partial<PageFormData>): Promise<DynamicPage> {
    await new Promise(resolve => setTimeout(resolve, 350))

    const index = pageStorage.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('页面不存在')
    }

    const currentPage = pageStorage[index]
    if (!currentPage) {
      throw new Error('页面不存在')
    }

    const updatedPage: DynamicPage = {
      ...currentPage,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    // 如果标题变了，更新路径
    if (data.title && data.title !== currentPage.title) {
      const newPath = `/dynamic/${data.title.toLowerCase().replace(/\s+/g, '-')}`
      const existingPage = pageStorage.find(p => p.path === newPath && p.id !== id)
      if (existingPage) {
        throw new Error('页面路径已存在')
      }
      updatedPage.path = newPath
    }

    pageStorage[index] = updatedPage
    return { ...updatedPage }
  }

  async deletePage(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = pageStorage.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('页面不存在')
    }

    const pageToDelete = pageStorage[index]
    if (!pageToDelete) {
      throw new Error('页面不存在')
    }

    // 防止删除系统示例页面
    if (pageToDelete.createdBy === 'system') {
      throw new Error('无法删除系统页面')
    }

    pageStorage.splice(index, 1)
  }

  async renderPage(id: string): Promise<ComponentDefinition> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const page = await this.getPage(id)
    if (!page) {
      throw new Error('页面不存在')
    }

    // 返回页面的根组件定义
    return {
      type: 'container',
      props: {
        maxWidth: page.layout.config?.maxWidth || 'container',
        padding: page.layout.config?.padding || 'medium',
        className: 'min-h-screen'
      },
      children: page.layout.sections.map(section => section.component)
    }
  }

  // 用于获取页面统计信息
  async getPageStats() {
    const pages = await this.getPages()
    return {
      total: pages.length,
      public: pages.filter(p => p.isPublic).length,
      private: pages.filter(p => !p.isPublic).length,
      byType: {
        single: pages.filter(p => p.layout.type === 'single').length,
        grid: pages.filter(p => p.layout.type === 'grid').length,
        sidebar: pages.filter(p => p.layout.type === 'sidebar').length,
        tabs: pages.filter(p => p.layout.type === 'tabs').length,
      }
    }
  }
}

// 导出单例实例
export const dynamicPageService = new DynamicPageServiceImpl()
