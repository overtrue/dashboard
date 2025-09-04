// 动态页面组件注册表
// 这个文件定义了所有可用于动态页面生成的组件及其配置

import { ComponentType, ComponentProps } from '@/types/dynamic-page'

// 组件配置接口
export interface ComponentConfig {
  type: ComponentType
  name: string
  description: string
  category: 'data' | 'form' | 'layout' | 'feedback' | 'navigation'
  props: PropConfig[]
  children?: boolean // 是否支持子组件
  examples: ComponentExample[]
}

// 属性配置
export interface PropConfig {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum'
  required: boolean
  default?: any
  description: string
  enumValues?: string[] // 枚举类型的可选值
}

// 使用示例
export interface ComponentExample {
  name: string
  description: string
  props: ComponentProps
  children?: ComponentExample[]
}

// 组件注册表
export const ComponentRegistry: ComponentConfig[] = [
  // 数据展示组件
  {
    type: 'table',
    name: '数据表格',
    description: '用于展示和操作数据列表，支持排序、筛选、分页等功能',
    category: 'data',
    props: [
      { name: 'data', type: 'array', required: true, description: '表格数据数组' },
      { name: 'columns', type: 'array', required: true, description: '列定义配置' },
      { name: 'loading', type: 'boolean', required: false, default: false, description: '加载状态' },
      { name: 'searchPlaceholder', type: 'string', required: false, default: '搜索...', description: '搜索框提示文字' },
      { name: 'emptyMessage', type: 'string', required: false, default: '暂无数据', description: '空数据提示' },
      { name: 'showRefresh', type: 'boolean', required: false, default: true, description: '显示刷新按钮' },
    ],
    children: false,
    examples: [
      {
        name: '用户列表',
        description: '显示用户信息的表格',
        props: {
          data: '{{users}}',
          columns: [
            { accessorKey: 'email', header: '邮箱' },
            { accessorKey: 'role', header: '角色' },
            { accessorKey: 'createdAt', header: '创建时间' }
          ],
          searchPlaceholder: '搜索用户...',
          emptyMessage: '暂无用户'
        }
      }
    ]
  },
  
  {
    type: 'card',
    name: '卡片',
    description: '用于内容分组的容器组件',
    category: 'layout',
    props: [
      { name: 'title', type: 'string', required: false, description: '卡片标题' },
      { name: 'description', type: 'string', required: false, description: '卡片描述' },
      { name: 'className', type: 'string', required: false, description: '自定义样式类' },
    ],
    children: true,
    examples: [
      {
        name: '信息卡片',
        description: '展示基本信息的卡片',
        props: {
          title: '用户统计',
          description: '当前系统用户数量统计'
        }
      }
    ]
  },

  {
    type: 'stats-grid',
    name: '统计网格',
    description: '展示多个统计数据的网格布局',
    category: 'data',
    props: [
      { name: 'stats', type: 'array', required: true, description: '统计数据数组' },
      { name: 'columns', type: 'number', required: false, default: 3, description: '列数' },
    ],
    children: false,
    examples: [
      {
        name: '系统统计',
        description: '显示系统各项统计数据',
        props: {
          stats: [
            { title: '总用户', value: '1,234', change: '+12%' },
            { title: '活跃用户', value: '856', change: '+5%' },
            { title: '今日新增', value: '42', change: '+18%' }
          ]
        }
      }
    ]
  },

  // 表单组件
  {
    type: 'form',
    name: '表单',
    description: '用于数据输入和提交的表单组件',
    category: 'form',
    props: [
      { name: 'fields', type: 'array', required: true, description: '表单字段配置' },
      { name: 'submitLabel', type: 'string', required: false, default: '提交', description: '提交按钮文字' },
      { name: 'cancelLabel', type: 'string', required: false, default: '取消', description: '取消按钮文字' },
      { name: 'loading', type: 'boolean', required: false, default: false, description: '提交加载状态' },
    ],
    children: false,
    examples: [
      {
        name: '用户创建表单',
        description: '创建新用户的表单',
        props: {
          fields: [
            { name: 'email', type: 'email', label: '邮箱', required: true },
            { name: 'password', type: 'password', label: '密码', required: true },
            { name: 'role', type: 'select', label: '角色', options: ['admin', 'user'] }
          ],
          submitLabel: '创建用户'
        }
      }
    ]
  },

  {
    type: 'button',
    name: '按钮',
    description: '触发操作的按钮组件',
    category: 'form',
    props: [
      { name: 'text', type: 'string', required: true, description: '按钮文字' },
      { name: 'variant', type: 'enum', required: false, default: 'default', 
        enumValues: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
        description: '按钮样式' },
      { name: 'size', type: 'enum', required: false, default: 'default',
        enumValues: ['default', 'sm', 'lg', 'icon'],
        description: '按钮大小' },
      { name: 'loading', type: 'boolean', required: false, default: false, description: '加载状态' },
      { name: 'disabled', type: 'boolean', required: false, default: false, description: '禁用状态' },
      { name: 'icon', type: 'string', required: false, description: '图标名称' },
    ],
    children: false,
    examples: [
      {
        name: '主要操作按钮',
        description: '执行主要操作的按钮',
        props: {
          text: '新建用户',
          variant: 'default',
          icon: 'RiAddLine'
        }
      },
      {
        name: '危险操作按钮',
        description: '执行删除等危险操作的按钮',
        props: {
          text: '删除',
          variant: 'destructive',
          icon: 'RiDeleteBinLine'
        }
      }
    ]
  },

  // 布局组件
  {
    type: 'container',
    name: '容器',
    description: '页面内容的容器组件，提供间距和布局',
    category: 'layout',
    props: [
      { name: 'maxWidth', type: 'enum', required: false, default: 'full',
        enumValues: ['full', 'container', 'small', 'medium', 'large'],
        description: '最大宽度' },
      { name: 'padding', type: 'enum', required: false, default: 'medium',
        enumValues: ['none', 'small', 'medium', 'large'],
        description: '内边距' },
      { name: 'className', type: 'string', required: false, description: '自定义样式类' },
    ],
    children: true,
    examples: [
      {
        name: '页面容器',
        description: '页面主要内容的容器',
        props: {
          maxWidth: 'container',
          padding: 'large'
        }
      }
    ]
  },

  {
    type: 'grid',
    name: '网格布局',
    description: '响应式网格布局组件',
    category: 'layout',
    props: [
      { name: 'columns', type: 'number', required: false, default: 2, description: '列数' },
      { name: 'gap', type: 'enum', required: false, default: 'medium',
        enumValues: ['small', 'medium', 'large'],
        description: '间距大小' },
      { name: 'className', type: 'string', required: false, description: '自定义样式类' },
    ],
    children: true,
    examples: [
      {
        name: '两列布局',
        description: '左右两列的网格布局',
        props: {
          columns: 2,
          gap: 'large'
        }
      }
    ]
  },

  // 反馈组件
  {
    type: 'alert',
    name: '提示框',
    description: '显示重要信息的提示组件',
    category: 'feedback',
    props: [
      { name: 'type', type: 'enum', required: false, default: 'info',
        enumValues: ['info', 'success', 'warning', 'error'],
        description: '提示类型' },
      { name: 'title', type: 'string', required: false, description: '提示标题' },
      { name: 'message', type: 'string', required: true, description: '提示内容' },
      { name: 'closable', type: 'boolean', required: false, default: false, description: '是否可关闭' },
    ],
    children: false,
    examples: [
      {
        name: '成功提示',
        description: '操作成功后的提示',
        props: {
          type: 'success',
          title: '操作成功',
          message: '用户创建成功！'
        }
      }
    ]
  },

  {
    type: 'loading',
    name: '加载状态',
    description: '显示加载状态的组件',
    category: 'feedback',
    props: [
      { name: 'text', type: 'string', required: false, default: '加载中...', description: '加载提示文字' },
      { name: 'size', type: 'enum', required: false, default: 'medium',
        enumValues: ['small', 'medium', 'large'],
        description: '加载器大小' },
    ],
    children: false,
    examples: [
      {
        name: '数据加载',
        description: '数据请求时的加载状态',
        props: {
          text: '正在加载数据...',
          size: 'medium'
        }
      }
    ]
  },

  {
    type: 'text',
    name: '文本',
    description: '显示文本内容的组件',
    category: 'data',
    props: [
      { name: 'content', type: 'string', required: true, description: '文本内容' },
      { name: 'variant', type: 'enum', required: false, default: 'body',
        enumValues: ['h1', 'h2', 'h3', 'h4', 'body', 'small', 'muted'],
        description: '文本样式' },
      { name: 'align', type: 'enum', required: false, default: 'left',
        enumValues: ['left', 'center', 'right'],
        description: '文本对齐' },
    ],
    children: false,
    examples: [
      {
        name: '页面标题',
        description: '页面的主标题',
        props: {
          content: '用户管理',
          variant: 'h1'
        }
      },
      {
        name: '描述文字',
        description: '页面的描述信息',
        props: {
          content: '管理系统用户账户，设置用户角色权限',
          variant: 'muted'
        }
      }
    ]
  }
]

// 根据类型获取组件配置
export function getComponentConfig(type: ComponentType): ComponentConfig | undefined {
  return ComponentRegistry.find(config => config.type === type)
}

// 获取所有组件类型
export function getAllComponentTypes(): ComponentType[] {
  return ComponentRegistry.map(config => config.type)
}

// 根据分类获取组件
export function getComponentsByCategory(category: string): ComponentConfig[] {
  return ComponentRegistry.filter(config => config.category === category)
}

// 组件使用指南（给AI参考）
export const ComponentUsageGuide = `
# 动态页面组件使用指南

## 数据绑定
- 使用 {{dataSourceId}} 语法绑定数据源
- 例如: data: "{{users}}" 表示绑定名为 "users" 的数据源

## 事件处理  
- 每个组件都可以配置 events 数组来处理用户交互
- 支持的事件类型: click, submit, change, delete, edit
- 事件可以触发 API 调用、页面导航、对话框等操作

## 布局原则
1. 使用 container 作为页面根容器
2. 用 grid 或 flex 组织子组件布局  
3. 用 card 对相关内容进行分组
4. 重要操作放在页面顶部的 actions 区域

## 常见页面模式

### 列表页面
1. 页面标题和描述 (text)
2. 操作按钮区域 (button-group) 
3. 数据表格 (table)
4. 分页组件 (pagination)

### 表单页面  
1. 页面标题 (text)
2. 表单容器 (card)
3. 表单组件 (form)
4. 提交按钮 (button)

### 详情页面
1. 返回按钮和标题 (button + text)
2. 信息卡片 (card) 
3. 相关数据表格 (table)
4. 操作按钮 (button-group)
`