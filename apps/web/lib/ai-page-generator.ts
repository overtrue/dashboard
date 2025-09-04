import { PageSuggestion, PageLayout, ComponentDefinition } from '@/types/dynamic-page'
import { ComponentRegistry, getComponentConfig } from '@/lib/component-registry'

// AI页面生成服务
export class AIPageGeneratorService {
  
  // 根据用户需求生成页面方案
  async generatePageSuggestions(prompt: string): Promise<PageSuggestion[]> {
    // 模拟AI处理时间
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 解析用户需求
    const analysis = this.analyzeUserPrompt(prompt)
    
    // 生成多个方案
    const suggestions: PageSuggestion[] = []
    
    // 方案1：经典布局
    suggestions.push(this.generateClassicLayout(analysis))
    
    // 方案2：现代网格布局  
    suggestions.push(this.generateGridLayout(analysis))
    
    // 方案3：侧边栏布局
    suggestions.push(this.generateSidebarLayout(analysis))
    
    return suggestions
  }

  // 分析用户输入的需求
  private analyzeUserPrompt(prompt: string): PromptAnalysis {
    const keywords = {
      // 功能关键词
      crud: ['增删改查', '管理', 'CRUD', '编辑', '删除', '新增', '创建'],
      list: ['列表', '表格', '清单', 'table', 'list'],
      form: ['表单', '输入', '填写', 'form', '提交'],
      stats: ['统计', '数据', '图表', 'stats', '分析'],
      filter: ['筛选', '过滤', '搜索', 'filter', 'search'],
      
      // 领域关键词  
      user: ['用户', 'user', '账户', '员工'],
      product: ['产品', 'product', '商品', '物品'],
      order: ['订单', 'order', '购买'],
      report: ['报告', 'report', '报表'],
    }
    
    const analysis: PromptAnalysis = {
      features: [],
      domain: 'general',
      layout: 'single',
      components: [],
      complexity: 'medium'
    }
    
    const lowerPrompt = prompt.toLowerCase()
    
    // 分析功能需求
    if (keywords.crud.some(kw => lowerPrompt.includes(kw))) {
      analysis.features.push('crud')
    }
    if (keywords.list.some(kw => lowerPrompt.includes(kw))) {
      analysis.features.push('list')
    }
    if (keywords.form.some(kw => lowerPrompt.includes(kw))) {
      analysis.features.push('form')  
    }
    if (keywords.stats.some(kw => lowerPrompt.includes(kw))) {
      analysis.features.push('stats')
    }
    if (keywords.filter.some(kw => lowerPrompt.includes(kw))) {
      analysis.features.push('filter')
    }
    
    // 分析领域
    if (keywords.user.some(kw => lowerPrompt.includes(kw))) {
      analysis.domain = 'user'
    } else if (keywords.product.some(kw => lowerPrompt.includes(kw))) {
      analysis.domain = 'product'
    } else if (keywords.order.some(kw => lowerPrompt.includes(kw))) {
      analysis.domain = 'order'
    } else if (keywords.report.some(kw => lowerPrompt.includes(kw))) {
      analysis.domain = 'report'
    }
    
    // 分析复杂度
    if (analysis.features.length >= 4) {
      analysis.complexity = 'high'
    } else if (analysis.features.length <= 2) {
      analysis.complexity = 'low'
    }
    
    return analysis
  }

  // 生成经典单栏布局
  private generateClassicLayout(analysis: PromptAnalysis): PageSuggestion {
    const sections: any[] = []
    
    // 页面头部
    sections.push({
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
              content: this.getDomainTitle(analysis.domain),
              variant: 'h1'
            }
          },
          ...(analysis.features.includes('crud') ? [{
            type: 'button',
            props: {
              text: `新建${this.getDomainName(analysis.domain)}`,
              variant: 'default',
              icon: 'RiAddLine'
            },
            events: [{
              type: 'click',
              action: {
                type: 'dialog',
                config: { dialogId: 'create-dialog' }
              }
            }]
          }] : [])
        ]
      }
    })
    
    // 统计信息
    if (analysis.features.includes('stats')) {
      sections.push({
        id: 'stats',
        type: 'content',
        component: {
          type: 'stats-grid',
          props: {
            stats: this.getStatsForDomain(analysis.domain)
          }
        }
      })
    }
    
    // 主要内容
    if (analysis.features.includes('list')) {
      sections.push({
        id: 'content',
        type: 'content',
        component: {
          type: 'table',
          props: {
            data: `{{${analysis.domain}s}}`,
            columns: this.getColumnsForDomain(analysis.domain),
            searchPlaceholder: `搜索${this.getDomainName(analysis.domain)}...`,
            emptyMessage: `暂无${this.getDomainName(analysis.domain)}数据`
          },
          dataSource: {
            type: 'api',
            config: {
              url: `/api/${analysis.domain}s`,
              method: 'GET'
            },
            refresh: {
              trigger: 'mount'
            }
          }
        }
      })
    } else {
      // 如果没有列表，添加一个基本内容区域
      sections.push({
        id: 'content', 
        type: 'content',
        component: {
          type: 'card',
          props: {
            title: '内容区域',
            description: '这里将显示主要内容'
          },
          children: [
            {
              type: 'text',
              props: {
                content: `欢迎使用${this.getDomainTitle(analysis.domain)}`,
                variant: 'body'
              }
            }
          ]
        }
      })
    }
    
    const layout: PageLayout = {
      type: 'single',
      sections,
      config: {
        maxWidth: 'container',
        padding: 'large'
      }
    }

    return {
      id: 'classic-' + Date.now(),
      title: `${this.getDomainTitle(analysis.domain)} - 经典布局`,
      description: '传统的单栏布局，简洁明了，适合大多数场景',
      preview: '顶部标题和操作按钮，下方数据表格，支持搜索和筛选',
      layout,
      confidence: 85,
      reasoning: '基于用户需求分析，选择了经典的单栏布局，包含页面标题、操作按钮和数据表格等基础组件'
    }
  }

  // 生成网格布局
  private generateGridLayout(analysis: PromptAnalysis): PageSuggestion {
    const sections: any[] = []
    
    // 页面头部
    sections.push({
      id: 'header',
      type: 'header',
      component: {
        type: 'text',
        props: {
          content: this.getDomainTitle(analysis.domain),
          variant: 'h1',
          align: 'center'
        }
      }
    })
    
    // 网格内容
    const gridChildren: ComponentDefinition[] = []
    
    if (analysis.features.includes('stats')) {
      gridChildren.push({
        type: 'card',
        props: {
          title: '数据统计',
          className: 'col-span-2'
        },
        children: [{
          type: 'stats-grid',
          props: {
            stats: this.getStatsForDomain(analysis.domain),
            columns: 2
          }
        }]
      })
    }
    
    if (analysis.features.includes('list')) {
      gridChildren.push({
        type: 'card',
        props: {
          title: `${this.getDomainName(analysis.domain)}列表`,
          className: 'col-span-3'
        },
        children: [{
          type: 'table',
          props: {
            data: `{{${analysis.domain}s}}`,
            columns: this.getColumnsForDomain(analysis.domain)
          }
        }]
      })
    }
    
    if (analysis.features.includes('form')) {
      gridChildren.push({
        type: 'card',
        props: {
          title: '快速操作',
          className: 'col-span-1'
        },
        children: [{
          type: 'form',
          props: {
            fields: this.getFieldsForDomain(analysis.domain),
            submitLabel: '提交'
          }
        }]
      })
    }
    
    sections.push({
      id: 'content',
      type: 'content',
      component: {
        type: 'grid',
        props: {
          columns: 4,
          gap: 'large',
          className: 'grid-cols-1 md:grid-cols-4'
        },
        children: gridChildren
      }
    })

    const layout: PageLayout = {
      type: 'grid',
      sections,
      config: {
        maxWidth: 'full',
        padding: 'large'
      }
    }

    return {
      id: 'grid-' + Date.now(),
      title: `${this.getDomainTitle(analysis.domain)} - 网格布局`,
      description: '现代化的网格布局，信息密度高，适合数据密集型应用',
      preview: '顶部标题居中，下方采用网格布局展示统计信息、数据列表和操作表单',
      layout,
      confidence: 75,
      reasoning: '采用网格布局可以更好地利用屏幕空间，同时展示多种信息，适合需要同时查看统计和操作的场景'
    }
  }

  // 生成侧边栏布局
  private generateSidebarLayout(analysis: PromptAnalysis): PageSuggestion {
    const sections: any[] = []
    
    // 主内容区
    const mainContent: ComponentDefinition[] = [{
      type: 'text',
      props: {
        content: this.getDomainTitle(analysis.domain),
        variant: 'h1'
      }
    }]
    
    if (analysis.features.includes('list')) {
      mainContent.push({
        type: 'table',
        props: {
          data: `{{${analysis.domain}s}}`,
          columns: this.getColumnsForDomain(analysis.domain)
        }
      })
    }
    
    sections.push({
      id: 'content',
      type: 'content',
      component: {
        type: 'container',
        props: {
          className: 'flex-1'
        },
        children: mainContent
      }
    })
    
    // 侧边栏
    const sidebarContent: ComponentDefinition[] = []
    
    if (analysis.features.includes('stats')) {
      sidebarContent.push({
        type: 'card',
        props: {
          title: '统计信息',
          className: 'mb-4'
        },
        children: [{
          type: 'stats-grid',
          props: {
            stats: this.getStatsForDomain(analysis.domain),
            columns: 1
          }
        }]
      })
    }
    
    if (analysis.features.includes('filter')) {
      sidebarContent.push({
        type: 'card',
        props: {
          title: '筛选条件'
        },
        children: [{
          type: 'form',
          props: {
            fields: [
              { name: 'status', type: 'select', label: '状态', options: ['all', 'active', 'inactive'] },
              { name: 'dateRange', type: 'input', label: '日期范围' }
            ],
            submitLabel: '筛选'
          }
        }]
      })
    }
    
    sections.push({
      id: 'sidebar',
      type: 'sidebar',
      component: {
        type: 'container',
        props: {
          className: 'w-80 space-y-4'
        },
        children: sidebarContent
      }
    })

    const layout: PageLayout = {
      type: 'sidebar',
      sections,
      config: {
        maxWidth: 'full',
        padding: 'large'
      }
    }

    return {
      id: 'sidebar-' + Date.now(),
      title: `${this.getDomainTitle(analysis.domain)} - 侧边栏布局`,
      description: '带侧边栏的布局，左侧主内容，右侧辅助信息和操作',
      preview: '主要内容区显示数据列表，右侧边栏展示统计信息和筛选条件',
      layout,
      confidence: 70,
      reasoning: '侧边栏布局适合需要展示辅助信息和提供筛选功能的场景，可以有效利用屏幕空间'
    }
  }

  // 辅助方法
  private getDomainTitle(domain: string): string {
    const titles = {
      user: '用户管理',
      product: '产品管理', 
      order: '订单管理',
      report: '报表管理',
      general: '数据管理'
    }
    return titles[domain as keyof typeof titles] || titles.general
  }

  private getDomainName(domain: string): string {
    const names = {
      user: '用户',
      product: '产品',
      order: '订单', 
      report: '报表',
      general: '数据'
    }
    return names[domain as keyof typeof names] || names.general
  }

  private getColumnsForDomain(domain: string) {
    const columns = {
      user: [
        { accessorKey: 'email', header: '邮箱' },
        { accessorKey: 'role', header: '角色' },
        { accessorKey: 'status', header: '状态' },
        { accessorKey: 'createdAt', header: '创建时间' }
      ],
      product: [
        { accessorKey: 'name', header: '产品名称' },
        { accessorKey: 'price', header: '价格' },
        { accessorKey: 'status', header: '状态' },
        { accessorKey: 'createdAt', header: '创建时间' }
      ],
      order: [
        { accessorKey: 'orderNo', header: '订单号' },
        { accessorKey: 'customer', header: '客户' },
        { accessorKey: 'amount', header: '金额' },
        { accessorKey: 'status', header: '状态' }
      ],
      general: [
        { accessorKey: 'name', header: '名称' },
        { accessorKey: 'status', header: '状态' },
        { accessorKey: 'createdAt', header: '创建时间' }
      ]
    }
    return columns[domain as keyof typeof columns] || columns.general
  }

  private getStatsForDomain(domain: string) {
    const stats = {
      user: [
        { title: '总用户数', value: '1,234', change: '+12%' },
        { title: '活跃用户', value: '856', change: '+5%' },
        { title: '今日新增', value: '42', change: '+18%' }
      ],
      product: [
        { title: '总产品数', value: '567', change: '+8%' },
        { title: '在售产品', value: '423', change: '+3%' },
        { title: '今日上新', value: '15', change: '+25%' }
      ],
      general: [
        { title: '总数量', value: '999', change: '+10%' },
        { title: '活跃数', value: '750', change: '+5%' },
        { title: '今日新增', value: '28', change: '+15%' }
      ]
    }
    return stats[domain as keyof typeof stats] || stats.general
  }

  private getFieldsForDomain(domain: string) {
    const fields = {
      user: [
        { name: 'email', type: 'email', label: '邮箱', required: true },
        { name: 'role', type: 'select', label: '角色', options: ['admin', 'user'] }
      ],
      product: [
        { name: 'name', type: 'input', label: '产品名称', required: true },
        { name: 'price', type: 'number', label: '价格', required: true }
      ],
      general: [
        { name: 'name', type: 'input', label: '名称', required: true },
        { name: 'description', type: 'textarea', label: '描述' }
      ]
    }
    return fields[domain as keyof typeof fields] || fields.general
  }
}

// 需求分析接口
interface PromptAnalysis {
  features: string[]
  domain: string  
  layout: string
  components: string[]
  complexity: 'low' | 'medium' | 'high'
}

// 导出单例实例
export const aiPageGenerator = new AIPageGeneratorService()