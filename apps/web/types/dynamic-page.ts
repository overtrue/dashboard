// 动态页面协议类型定义

// 页面基本信息
export interface DynamicPage {
  id: string
  title: string
  description?: string
  icon?: string
  path: string
  layout: PageLayout
  createdAt: string
  updatedAt: string
  createdBy?: string
  isPublic?: boolean
}

// 页面布局
export interface PageLayout {
  type: 'single' | 'grid' | 'sidebar' | 'tabs'
  sections: Section[]
  config?: {
    maxWidth?: 'full' | 'container' | 'small' | 'medium' | 'large'
    padding?: 'none' | 'small' | 'medium' | 'large'
    background?: 'default' | 'muted' | 'accent'
  }
}

// 页面区块
export interface Section {
  id: string
  type: 'header' | 'content' | 'sidebar' | 'footer' | 'actions'
  title?: string
  component: ComponentDefinition
  style?: {
    className?: string
    width?: string | number
    height?: string | number
  }
}

// 组件定义
export interface ComponentDefinition {
  type: ComponentType
  props: ComponentProps
  children?: ComponentDefinition[]
  events?: ComponentEvent[]
  dataSource?: DataSource
}

// 支持的组件类型
export type ComponentType = 
  // 数据展示
  | 'table'
  | 'card'
  | 'list'
  | 'stats-grid'
  | 'badge'
  | 'text'
  
  // 表单组件
  | 'form'
  | 'input'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  
  // 交互组件
  | 'button'
  | 'button-group'
  | 'dropdown'
  | 'dialog'
  | 'tabs'
  
  // 布局组件
  | 'container'
  | 'grid'
  | 'flex'
  | 'divider'
  
  // 反馈组件
  | 'alert'
  | 'loading'
  | 'empty'

// 组件属性（不同组件类型有不同属性）
export interface ComponentProps {
  [key: string]: any
}

// 组件事件
export interface ComponentEvent {
  type: 'click' | 'submit' | 'change' | 'delete' | 'edit'
  action: EventAction
}

// 事件动作
export interface EventAction {
  type: 'api' | 'navigate' | 'dialog' | 'update' | 'custom'
  config: {
    // API调用
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    url?: string
    params?: Record<string, any>
    
    // 页面导航
    path?: string
    
    // 对话框
    dialogId?: string
    
    // 数据更新
    targetId?: string
    updateType?: 'refresh' | 'append' | 'replace'
    
    // 自定义脚本
    script?: string
  }
}

// 数据源配置
export interface DataSource {
  type: 'api' | 'static' | 'computed'
  config: {
    // API数据源
    url?: string
    method?: 'GET' | 'POST'
    params?: Record<string, any>
    transform?: string // 数据转换脚本
    
    // 静态数据
    data?: any
    
    // 计算数据（基于其他数据源）
    dependencies?: string[] // 依赖的数据源ID
    computation?: string // 计算脚本
  }
  refresh?: {
    interval?: number // 自动刷新间隔(秒)
    trigger?: 'mount' | 'focus' | 'manual'
  }
}

// 页面保存表单数据
export interface PageFormData {
  title: string
  description?: string
  icon?: string
  layout: PageLayout
  addToMenu?: boolean
  menuSection?: 'user_custom' | 'admin_fixed'
}

// AI生成的页面方案
export interface PageSuggestion {
  id: string
  title: string
  description: string
  preview: string // 预览描述
  layout: PageLayout
  confidence: number // 匹配度 0-100
  reasoning: string // AI的推理过程
}

// 页面服务接口
export interface DynamicPageService {
  getPages(): Promise<DynamicPage[]>
  getPage(id: string): Promise<DynamicPage | null>
  savePage(data: PageFormData): Promise<DynamicPage>
  updatePage(id: string, data: Partial<PageFormData>): Promise<DynamicPage>
  deletePage(id: string): Promise<void>
  renderPage(id: string): Promise<ComponentDefinition>
}