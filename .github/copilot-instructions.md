# GitHub Copilot Instructions for AI Dashboard Generator

## 项目概述
这是一个基于 AI 驱动的动态管理后台应用项目，通过数据库存储的 JSON 协议动态渲染界面。项目包含前端界面、后端API服务和AI服务，采用现代化的技术栈，使用 OriginUI 作为 UI 组件库，参考 Crafted 面板布局设计。

## 核心架构理念
这不是一个传统的代码生成器，而是一个 **AI 驱动的动态管理后台应用**：
- **实时 AI 交互**：所有界面和交互都通过 AI + 基本 UI 交互实时生成
- **协议驱动渲染**：界面信息以 JSON 协议存储到数据库，动态渲染
- **数据库驱动**：左侧菜单、页面结构、视图、工作流都按协议存储在数据库表中
- **动态展示**：根据协议约定动态渲染所有组件和布局

## 技术栈（全部使用最新版）
- **Frontend**: React 19+, TypeScript 5+, Tailwind CSS v4+, Next.js App Router
- **UI Library**: OriginUI（基于 shadcn/ui）、Radix UI（最新版）、Framer Motion（最新版）
- **Backend**: Node.js（最新版）/AdonisJS（最新版），PostgreSQL/MySQL（最新版）
- **AI Integration**: OpenAI/Claude API（最新版）
- **Build Tools**: Next.js（最新版）、ESLint、Prettier
- **Testing**: Vitest、React Testing Library（最新版）

### 架构设计理念（参考 Dify）

#### 1. **前端架构**（Next.js App Router）
- **分组路由**：使用 `(groupName)` 模式组织不同功能模块
- **布局嵌套**：每个路由组都有自己的 layout.tsx
- **组件分层**：UI 组件 → 功能组件 → 页面组件 → 布局组件
- **Context 管理**：全局状态通过 React Context 管理

#### 2. **后端架构**（Express/Node.js）
- **路由分组**：按功能模块组织 API 路由
- **分层架构**：Route → Controller → Service → Model
- **中间件系统**：认证、日志、错误处理等
- **数据库抽象**：统一的数据访问层
- **AI 集成**：内置 AI 服务处理协议生成和优化

#### 3. **数据库设计**
- **协议存储**：JSON 格式存储界面协议
- **版本控制**：支持协议版本管理和回滚
- **用户管理**：权限和角色控制
- **日志记录**：操作审计和性能监控

#### 4. **开发工作流**
- **类型安全**：前端定义类型，后端通过 API 规范保持一致
- **API 契约**：统一的 API 规范和文档
- **组件开发**：shadcn/ui + OriginUI 模式
- **测试策略**：单元测试 + 集成测试 + E2E 测试

### 数据库协议设计
```typescript
// 菜单协议
interface MenuProtocol {
  id: string
  title: string
  icon: string
  path: string
  type: 'page' | 'group' | 'external'
  children?: MenuProtocol[]
  permissions?: string[]
  metadata?: Record<string, any>
}

// 页面协议
interface PageProtocol {
  id: string
  title: string
  type: 'dashboard' | 'table' | 'form' | 'chart' | 'custom'
  layout: LayoutProtocol
  components: ComponentProtocol[]
  workflows?: WorkflowProtocol[]
  metadata?: Record<string, any>
}

// 组件协议
interface ComponentProtocol {
  id: string
  type: string
  props: Record<string, any>
  children?: ComponentProtocol[]
  events?: EventProtocol[]
  validation?: ValidationProtocol[]
}

// 工作流协议
interface WorkflowProtocol {
  id: string
  name: string
  trigger: TriggerProtocol
  steps: StepProtocol[]
  conditions?: ConditionProtocol[]
}
```

## UI 组件库（OriginUI）

### 使用 OriginUI 组件（shadcn 模式）
```bash
# OriginUI 基于 shadcn 模式，按组件单独添加
# 例如添加导航组件
npx shadcn add https://originui.com/r/comp-577.json

# 添加其他 OriginUI 组件
npx shadcn add https://originui.com/r/comp-[id].json

# 参考 Crafted 面板布局实验
npx shadcn add https://ui-experiments-green.vercel.app/r/experiment-01.json
```

### OriginUI 组件集成
```typescript
// 使用添加后的 OriginUI 组件
import { NavigationMenu } from "@/components/ui/navigation-menu"
import { DataTable } from "@/components/ui/data-table"
import { DashboardCard } from "@/components/ui/dashboard-card"

// 保持 shadcn 风格的组件定义，结合 OriginUI 设计
function CustomCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="custom-card"
      className={cn("bg-card text-card-foreground rounded-xl border shadow-sm", className)}
      {...props}
    />
  )
}
```

## 代码风格规范（参考 shadcn-ui）

### 文件命名约定
- 组件文件: `kebab-case.tsx` (如 `data-table.tsx`, `app-sidebar.tsx`)
- UI 组件: `kebab-case.tsx` (如 `card.tsx`, `button.tsx`)
- 工具函数: `kebab-case.ts` (如 `format-data.ts`, `get-config.ts`)
- 常量文件: `kebab-case.ts` (如 `api-endpoints.ts`)
- 类型定义: `types.ts` 或 `[feature].types.ts`
- Hook 文件: `use-[name].ts` (如 `use-sidebar.ts`)

### OriginUI 组件使用规范
```typescript
// 使用通过 shadcn 添加的 OriginUI 组件
import { NavigationMenu } from "@/components/ui/navigation-menu"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// 保持 shadcn 风格的组件定义
function CustomCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="custom-card"
      className={cn("bg-card text-card-foreground rounded-xl border shadow-sm", className)}
      {...props}
    />
  )
}
```

### cn() 工具函数模式
```typescript
// lib/utils.ts - 必须包含的核心工具函数
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 开发指南

### shadcn-ui 组件开发模式
1. **组合优于继承**: 使用多个小组件组合成复杂组件
2. **data-slot 属性**: 每个组件使用 `data-slot` 标识
3. **forwardRef 模式**: 所有基础组件支持 ref 传递
4. **Polymorphic 组件**: 支持 `asChild` 属性改变渲染元素

### 动态渲染组件模板
```typescript
// 动态组件渲染器模板
import * as React from "react"
import { cn } from "@/lib/utils"
import type { ComponentProtocol } from "@/types/protocols"

interface DynamicComponentProps {
  protocol: ComponentProtocol
  className?: string
}

function DynamicComponent({
  protocol,
  className,
  ...props
}: DynamicComponentProps & React.ComponentProps<"div">) {
  const Component = getComponentByType(protocol.type)

  if (!Component) {
    console.warn(`Unknown component type: ${protocol.type}`)
    return null
  }

  return (
    <Component
      {...protocol.props}
      className={cn(protocol.props.className, className)}
      data-protocol-id={protocol.id}
      {...props}
    >
      {protocol.children?.map((child) => (
        <DynamicComponent
          key={child.id}
          protocol={child}
        />
      ))}
    </Component>
  )
}

// 协议解析器模板
function parseComponentProtocol(data: any): ComponentProtocol {
  return {
    id: data.id || generateId(),
    type: data.type,
    props: data.props || {},
    children: data.children?.map(parseComponentProtocol) || [],
    events: data.events || []
  }
}

// 动态页面渲染器
interface DynamicPageProps {
  protocol: PageProtocol
}

function DynamicPage({ protocol }: DynamicPageProps) {
  return (
    <div data-page-id={protocol.id} className="dynamic-page">
      <h1>{protocol.title}</h1>
      {protocol.components.map((component) => (
        <DynamicComponent
          key={component.id}
          protocol={component}
        />
      ))}
    </div>
  )
}
```

### AI 对话组件开发
```typescript
// AI 对话相关组件应遵循以下模式
interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

interface ChatComponentProps {
  messages: ChatMessage[]
  onSendMessage: (content: string) => void
  isLoading?: boolean
}
```

### 数据处理规范
```typescript
// 数据源连接接口
interface DataSource {
  id: string
  name: string
  type: 'mysql' | 'postgresql' | 'mongodb' | 'api'
  config: ConnectionConfig
  schema?: SchemaDefinition
}

// SQL 查询构建器
interface QueryBuilder {
  table(name: string): QueryBuilder
  select(columns: string[]): QueryBuilder
  where(conditions: WhereCondition[]): QueryBuilder
  build(): string
}
```

### 插件系统开发
```typescript
// 插件接口定义
interface Plugin {
  name: string
  version: string
  description: string
  components: PluginComponent[]
  hooks?: PluginHooks
  install(): Promise<void>
  uninstall(): Promise<void>
}

interface PluginComponent {
  name: string
  type: ComponentType
  props: PropDefinition[]
  render: React.ComponentType<any>
}
```

## 代码生成规则

### 当生成 UI 组件时:
1. 使用 `React.ComponentProps<"element">` 定义 props
2. 使用 `cn()` 函数合并 className
3. 添加 `data-slot` 属性标识组件
4. 支持 `...props` 透传
5. 遵循 shadcn-ui 的设计系统

### 当生成复合组件时:
```typescript
// 示例：Card 组件系列
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
```

### 当生成页面级组件（blocks）时:
1. 组合多个 UI 组件
2. 包含完整的功能逻辑
3. 可配置的 props 接口
4. 响应式设计考虑

### 当生成 API 代码时:
1. 使用 async/await 语法
2. 包含错误处理
3. 添加类型定义
4. 使用统一的响应格式

### 当生成数据库相关代码时:
1. 使用参数化查询防止 SQL 注入
2. 包含数据验证
3. 添加适当的索引建议
4. 考虑数据迁移脚本

## Tailwind CSS v4 规范
```typescript
// 使用最新的 Tailwind v4 语法
const cardStyles = cn(
  // 基础样式
  "rounded-lg border shadow-sm",
  // 颜色系统（v4 新语法）
  "bg-card text-card-foreground",
  // 响应式设计
  "w-full md:w-auto lg:max-w-md",
  // 状态变体
  "hover:shadow-md focus-visible:outline-none focus-visible:ring-2",
  className
)
```

## 测试规范（shadcn 风格）
```typescript
// 组件测试模板
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"

import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
  })

  it("handles click events", async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole("button"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("applies custom className", () => {
    render(<Button className="custom-class">Button</Button>)
    expect(screen.getByRole("button")).toHaveClass("custom-class")
  })
})
```

## 性能优化指南
1. 使用 React.memo 优化重渲染
2. 使用 useMemo 和 useCallback 优化计算
3. 实现虚拟滚动处理大数据集
4. 使用 Suspense 和 lazy loading

## 安全考虑
1. 输入验证和清理
2. XSS 防护
3. CSRF 令牌
4. 权限检查
5. 敏感数据加密

## 常用工具函数（shadcn 模式）

### 类名合并工具
```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 数据转换
```typescript
// lib/transforms.ts
export function transformApiData<T, R>(
  data: T,
  transformer: (item: T) => R
): R {
  return transformer(data)
}
```

### 错误处理
```typescript
// lib/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return "An unexpected error occurred"
}
```

### 验证函数
```typescript
// lib/validations.ts
import { z } from "zod"

export const createValidationSchema = <T>(schema: z.ZodSchema<T>) => {
  return {
    parse: (data: unknown) => schema.parse(data),
    safeParse: (data: unknown) => schema.safeParse(data),
  }
}
```

## AI 提示词模板

当用户请求生成特定功能时，参考以下模板:

### 生成 UI 组件
"请创建一个 [组件名] 组件，遵循 shadcn-ui 的设计模式，包含完整的 TypeScript 类型定义和 Tailwind v4 样式"

### 生成数据表格组件
"请创建一个数据表格组件，使用 shadcn Table 组件作为基础，支持排序、筛选、分页功能"

### 生成表单组件
"请创建一个表单组件，使用 shadcn Form 组件，支持验证和错误提示"

### 生成页面级组件（block）
"请创建一个 [功能] 页面组件，组合多个 UI 组件，包含完整的交互逻辑"

## 项目特定规范

### 组件命名规范
- UI 组件：`button.tsx`, `card.tsx`, `table.tsx`
- 复合组件：`data-table.tsx`, `app-sidebar.tsx`
- 页面组件：`dashboard-page.tsx`, `settings-page.tsx`
- Hook：`use-sidebar.ts`, `use-data-table.ts`

### 导入别名配置
```typescript
// frontend/tsconfig.json paths
{
  "paths": {
    "@/*": ["./app/*", "./src/*"],
    "@/components/*": ["./app/components/*"],
    "@/ui/*": ["./app/components/ui/*"],
    "@/lib/*": ["./app/lib/*"],
    "@/hooks/*": ["./app/hooks/*"],
    "@/types/*": ["./app/types/*"],
    "@/service/*": ["./app/service/*"]
  }
}
```

### 动态协议数据库存储
```typescript
// 数据库存储的协议结构
interface StoredProtocol {
  id: string
  type: 'page' | 'component' | 'menu' | 'workflow'
  name: string
  data: any // JSON 协议数据
  version: number
  created_at: Date
  updated_at: Date
}

// 协议服务类
class ProtocolService {
  async getPageProtocol(pageId: string): Promise<PageProtocol> {
    const stored = await db.protocols.findUnique({
      where: { id: pageId, type: 'page' }
    })
    return parsePageProtocol(stored.data)
  }

  async saveProtocol(protocol: any): Promise<void> {
    await db.protocols.upsert({
      where: { id: protocol.id },
      create: {
        id: protocol.id,
        type: protocol.type,
        name: protocol.name,
        data: protocol,
        version: 1
      },
      update: {
        data: protocol,
        version: { increment: 1 },
        updated_at: new Date()
      }
    })
  }
}
```

### AI 实时交互能力
```typescript
// AI 驱动的界面生成
interface AIInteractionService {
  generatePageFromPrompt(prompt: string): Promise<PageProtocol>
  optimizeLayout(pageId: string): Promise<PageProtocol>
  suggestComponents(context: any): Promise<ComponentProtocol[]>
  analyzeUserBehavior(data: any): Promise<UIOptimization[]>
}

// 实时界面调整
class DynamicUIService {
  async updatePageLayout(pageId: string, changes: any) {
    const protocol = await this.protocolService.getPageProtocol(pageId)
    const updatedProtocol = await this.aiService.applyChanges(protocol, changes)
    await this.protocolService.saveProtocol(updatedProtocol)
    return updatedProtocol
  }

  async generateFromConversation(messages: Message[]): Promise<PageProtocol> {
    const context = this.analyzeConversation(messages)
    return await this.aiService.generatePageFromPrompt(context.summary)
  }
}
```

### 核心技术要求

1. **动态渲染优先**：所有 UI 都通过 JSON 协议动态生成，不写死组件
2. **数据库驱动**：界面配置存储在数据库，支持版本控制和回滚
3. **AI 集成**：支持自然语言描述生成界面，实时优化布局
4. **性能优化**：协议解析缓存，组件懒加载，虚拟化长列表
5. **类型安全**：所有协议都有完整的 TypeScript 类型定义

### 开发重点

- 使用 shadcn/ui 的编码风格但专注于动态渲染
- 协议优先设计，组件是协议的执行器
- 数据库存储 JSON 协议，支持实时更新
- AI 驱动的界面生成和优化
- 遵循 OriginUI 的设计系统和组件规范

---

**重要提示**:
1. 始终遵循 shadcn-ui 的设计原则和代码风格，但专注于动态渲染
2. 使用最新版本的所有技术栈（React 19, Tailwind v4 等）
3. 优先考虑协议的可扩展性和组件的动态性
4. 确保所有协议都有完整的 TypeScript 类型定义
5. 遵循无障碍访问标准（使用 Radix UI 原语）
6. 当有疑问时，参考 shadcn-ui 的编码风格但适应动态渲染需求
7. **核心原则**：数据库存储协议，动态渲染界面，AI 驱动交互
