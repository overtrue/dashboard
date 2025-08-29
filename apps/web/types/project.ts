// 业务项目隔离相关类型定义
// 用于 AI 运营后台的业务隔离，非传统项目管理
// 简化模型，只保留基本的隔离和组织信息

export interface ProjectProtocol {
  id: string
  name: string
  description?: string
  owner?: string
  team?: string[]
  tags?: string[]
  // 业务隔离相关字段
  dataSourceIds?: string[] // 关联的数据源
  environment?: 'development' | 'staging' | 'production'
  createdAt: string
  updatedAt: string
}

export interface ProjectFormData {
  name: string
  description?: string
  owner?: string
  team?: string[]
  tags?: string[]
  environment?: 'development' | 'staging' | 'production'
}

export interface ProjectStats {
  total: number
  byEnvironment: {
    development: number
    staging: number
    production: number
  }
}

// 项目服务接口 - 业务隔离管理
export interface ProjectService {
  getProjects(): Promise<ProjectProtocol[]>
  getProject(id: string): Promise<ProjectProtocol | null>
  createProject(data: ProjectFormData): Promise<ProjectProtocol>
  updateProject(id: string, data: Partial<ProjectFormData>): Promise<ProjectProtocol>
  deleteProject(id: string): Promise<void>
  getProjectStats(): Promise<ProjectStats>
}