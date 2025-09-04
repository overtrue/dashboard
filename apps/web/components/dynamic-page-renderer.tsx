'use client'

import { ComponentDefinition, DataSource } from '@/types/dynamic-page'
import React, { useEffect, useMemo, useState } from 'react'

// 导入UI组件
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { UnifiedTable } from '@/components/ui/unified-table'
import { cn } from '@/lib/utils'

// 图标导入
import {
    RiAddLine,
    RiDeleteBinLine,
    RiEditLine,
    RiFileLine,
    RiRefreshLine,
    RiUserLine
} from '@remixicon/react'

// 图标映射
const iconMap: Record<string, React.ComponentType<any>> = {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiRefreshLine,
  RiFileLine,
  RiUserLine
}

// 动态页面渲染器Props
interface DynamicPageRendererProps {
  definition: ComponentDefinition
  data?: Record<string, any>
  onEvent?: (eventType: string, eventData: any) => void
}

// 数据上下文
interface DataContextValue {
  data: Record<string, any>
  setData: (key: string, value: any) => void
  loading: Record<string, boolean>
  setLoading: (key: string, loading: boolean) => void
}

const DataContext = React.createContext<DataContextValue>({
  data: {},
  setData: () => {},
  loading: {},
  setLoading: () => {}
})

// 主渲染器组件
export function DynamicPageRenderer({
  definition,
  data: initialData = {},
  onEvent
}: DynamicPageRendererProps) {
  const [data, setDataState] = useState<Record<string, any>>(initialData)
  const [loading, setLoadingState] = useState<Record<string, boolean>>({})

  const setData = (key: string, value: any) => {
    setDataState(prev => ({ ...prev, [key]: value }))
  }

  const setLoading = (key: string, loading: boolean) => {
    setLoadingState(prev => ({ ...prev, [key]: loading }))
  }

  const contextValue: DataContextValue = {
    data,
    setData,
    loading,
    setLoading
  }

  return (
    <DataContext.Provider value={contextValue}>
      <ComponentRenderer definition={definition} onEvent={onEvent} />
    </DataContext.Provider>
  )
}

// 组件渲染器
function ComponentRenderer({
  definition,
  onEvent
}: {
  definition: ComponentDefinition
  onEvent?: (eventType: string, eventData: any) => void
}) {
  const { data, setData, loading, setLoading } = React.useContext(DataContext)

  // 数据获取
  useEffect(() => {
    if (definition.dataSource) {
      fetchData(definition.dataSource, setData, setLoading)
    }
  }, [definition.dataSource, setData, setLoading])

  // 处理事件
  const handleEvent = (eventType: string, eventData: any) => {
    definition.events?.forEach(event => {
      if (event.type === eventType) {
        executeEventAction(event.action, eventData, { data, setData, onEvent })
      }
    })
  }

  // 解析数据绑定
  const resolvedProps = useMemo(() => {
    return resolveDataBinding(definition.props, data)
  }, [definition.props, data])

  // 渲染组件
  switch (definition.type) {
    case 'container':
      return <ContainerComponent {...resolvedProps} onEvent={handleEvent}>
        {definition.children?.map((child, index) => (
          <ComponentRenderer key={index} definition={child} onEvent={onEvent} />
        ))}
      </ContainerComponent>

    case 'text':
      return <TextComponent {...resolvedProps} />

    case 'button':
      return <ButtonComponent {...resolvedProps} onEvent={handleEvent} />

    case 'card':
      return <CardComponent {...resolvedProps} onEvent={handleEvent}>
        {definition.children?.map((child, index) => (
          <ComponentRenderer key={index} definition={child} onEvent={onEvent} />
        ))}
      </CardComponent>

    case 'table':
      const tableData = definition.dataSource ?
        data[getDataSourceKey(definition.dataSource)] : resolvedProps.data
      const tableLoading = definition.dataSource ?
        loading[getDataSourceKey(definition.dataSource)] : false

      return <TableComponent
        {...resolvedProps}
        data={tableData || []}
        loading={tableLoading}
        onEvent={handleEvent}
      />

    case 'form':
      return <FormComponent {...resolvedProps} onEvent={handleEvent} />

    case 'stats-grid':
      return <StatsGridComponent {...resolvedProps} />

    case 'grid':
      return <GridComponent {...resolvedProps} onEvent={handleEvent}>
        {definition.children?.map((child, index) => (
          <ComponentRenderer key={index} definition={child} onEvent={onEvent} />
        ))}
      </GridComponent>

    case 'alert':
      return <AlertComponent {...resolvedProps} />

    case 'loading':
      return <LoadingComponent {...resolvedProps} />

    default:
      console.warn('Unknown component type:', definition.type)
      return <div className="p-4 bg-red-50 text-red-600 rounded">
        未知组件类型: {definition.type}
      </div>
  }
}

// 具体组件实现
function ContainerComponent({
  className,
  maxWidth,
  padding,
  children,
  ...props
}: any) {
  const maxWidthClasses: Record<string, string> = {
    full: 'max-w-full',
    container: 'max-w-7xl mx-auto',
    small: 'max-w-2xl mx-auto',
    medium: 'max-w-4xl mx-auto',
    large: 'max-w-6xl mx-auto'
  }

  const paddingClasses: Record<string, string> = {
    none: '',
    small: 'p-2',
    medium: 'p-4',
    large: 'p-6'
  }

  return (
    <div className={cn(
      maxWidthClasses[maxWidth as keyof typeof maxWidthClasses] || maxWidthClasses.container,
      paddingClasses[padding as keyof typeof paddingClasses] || paddingClasses.medium,
      className
    )} {...props}>
      {children}
    </div>
  )
}

function TextComponent({ content, variant, align, className }: any) {
  const variants: Record<string, string> = {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-semibold',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-medium',
    body: 'text-base',
    small: 'text-sm',
    muted: 'text-sm text-muted-foreground'
  }

  const alignClasses: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const Component = variant?.startsWith('h') ? variant : 'div'

  return React.createElement(Component, {
    className: cn(
      variants[variant as keyof typeof variants] || variants.body,
      alignClasses[align as keyof typeof alignClasses] || alignClasses.left,
      className
    )
  }, content)
}

function ButtonComponent({
  text,
  variant = 'default',
  size = 'default',
  icon,
  loading,
  disabled,
  onEvent,
  ...props
}: any) {
  const IconComponent = icon && iconMap[icon]

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      onClick={() => onEvent?.('click', { text, variant })}
      {...props}
    >
      {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
      {loading ? '加载中...' : text}
    </Button>
  )
}

function CardComponent({ title, description, className, children, ...props }: any) {
  return (
    <Card className={className} {...props}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

function TableComponent({
  data = [],
  columns = [],
  loading = false,
  searchPlaceholder = '搜索...',
  emptyMessage = '暂无数据',
  onEvent
}: any) {
  return (
    <UnifiedTable
      data={data}
      columns={columns}
      loading={loading}
      searchable={true}
      filterable={true}
      sortable={true}
      pagination={true}
      emptyState={{
        title: emptyMessage,
        description: '没有找到匹配的数据'
      }}
    />
  )
}

function FormComponent({ fields = [], submitLabel = '提交', cancelLabel = '取消', loading, onEvent }: any) {
  const [formData, setFormData] = useState<Record<string, any>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEvent?.('submit', formData)
  }

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field: any, index: number) => (
        <div key={index} className="space-y-2">
          <label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {field.type === 'select' ? (
            <Select onValueChange={(value) => handleFieldChange(field.name, value)}>
              <SelectTrigger>
                <SelectValue placeholder={`选择${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === 'textarea' ? (
            <Textarea
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
          ) : (
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
            />
          )}
        </div>
      ))}

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? '提交中...' : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onEvent?.('cancel', {})}
        >
          {cancelLabel}
        </Button>
      </div>
    </form>
  )
}

function StatsGridComponent({ stats = [], columns = 3, className }: any) {
  return (
    <div className={cn(
      `grid gap-4`,
      `grid-cols-1 md:grid-cols-${Math.min(columns, 4)}`,
      className
    )}>
      {stats.map((stat: any, index: number) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.title}</p>
            {stat.change && (
              <div className="text-xs text-green-600">{stat.change}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function GridComponent({ columns = 2, gap = 'medium', className, children, ...props }: any) {
  const gapClasses: Record<string, string> = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6'
  }

  return (
    <div
      className={cn(
        'grid',
        `grid-cols-1 md:grid-cols-${Math.min(columns, 6)}`,
        gapClasses[gap as keyof typeof gapClasses] || gapClasses.medium,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function AlertComponent({ type = 'info', title, message, closable }: any) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <Alert className="mb-4">
      <div className="flex items-start">
        <div className="flex-1">
          {title && <h4 className="font-medium mb-1">{title}</h4>}
          <div>{message}</div>
        </div>
        {closable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisible(false)}
            className="ml-2"
          >
            ×
          </Button>
        )}
      </div>
    </Alert>
  )
}

function LoadingComponent({ text = '加载中...', size = 'medium' }: any) {
  const sizes: Record<string, string> = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8'
  }

  return (
    <div className="flex items-center justify-center p-8">
      <Skeleton className={cn(sizes[size as keyof typeof sizes], 'mr-2')} />
      <span className="text-muted-foreground">{text}</span>
    </div>
  )
}

// 辅助函数
function resolveDataBinding(props: any, data: Record<string, any>): any {
  const resolved = { ...props }

  Object.keys(resolved).forEach(key => {
    if (typeof resolved[key] === 'string' && resolved[key].startsWith('{{') && resolved[key].endsWith('}}')) {
      const dataKey = resolved[key].slice(2, -2)
      resolved[key] = data[dataKey]
    }
  })

  return resolved
}

async function fetchData(
  dataSource: DataSource,
  setData: (key: string, value: any) => void,
  setLoading: (key: string, loading: boolean) => void
) {
  if (dataSource.type !== 'api') return

  const key = getDataSourceKey(dataSource)
  setLoading(key, true)

  try {
    const response = await fetch(dataSource.config.url!, {
      method: dataSource.config.method || 'GET',
      headers: dataSource.config.params ? {
        'Content-Type': 'application/json'
      } : undefined,
      body: dataSource.config.params ? JSON.stringify(dataSource.config.params) : undefined
    })

    if (response.ok) {
      const result = await response.json()
      setData(key, result)
    } else {
      console.error('Failed to fetch data:', response.statusText)
      setData(key, [])
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    setData(key, [])
  } finally {
    setLoading(key, false)
  }
}

function getDataSourceKey(dataSource: DataSource): string {
  return dataSource.config.url?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown'
}

function executeEventAction(
  action: any,
  eventData: any,
  context: { data: any, setData: any, onEvent?: any }
) {
  switch (action.type) {
    case 'api':
      // 执行API调用
      console.log('Execute API:', action.config)
      break
    case 'navigate':
      // 页面导航
      if (action.config.path) {
        window.location.href = action.config.path
      }
      break
    case 'dialog':
      // 打开对话框
      console.log('Open dialog:', action.config.dialogId)
      break
    default:
      context.onEvent?.(action.type, { action, eventData })
  }
}
