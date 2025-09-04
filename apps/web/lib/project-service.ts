import { ProjectFormData, ProjectProtocol, ProjectService, ProjectStats } from '@/types/project'

// 模拟业务隔离项目数据存储
const projectStorage: ProjectProtocol[] = [
  {
    id: '1',
    name: 'AI客服系统',
    description: '智能客服聊天机器人业务隔离环境，集成多个NLP数据源',
    owner: 'Alice Johnson',
    team: ['Alice Johnson', 'Bob Smith', 'Carol Wang'],
    tags: ['ai', 'nlp', '客服'],
    dataSourceIds: ['ds-1', 'ds-2'], // 关联的数据源ID
    environment: 'production',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z'
  },
  {
    id: '2',
    name: '数据分析平台',
    description: '业务数据分析和可视化，连接多个数据仓库',
    owner: 'David Lee',
    team: ['David Lee', 'Eva Chen'],
    tags: ['analytics', 'dashboard', '数据'],
    dataSourceIds: ['ds-3', 'ds-4', 'ds-5'],
    environment: 'production',
    createdAt: '2023-11-01T09:00:00Z',
    updatedAt: '2024-01-31T16:45:00Z'
  },
  {
    id: '3',
    name: '推荐系统测试',
    description: '机器学习推荐算法的测试环境，隔离实验数据',
    owner: 'Frank Zhang',
    team: ['Frank Zhang'],
    tags: ['ml', 'recommendations', '算法'],
    dataSourceIds: ['ds-6'],
    environment: 'staging',
    createdAt: '2024-02-01T10:15:00Z',
    updatedAt: '2024-02-15T11:20:00Z'
  }
]

export class ProjectServiceImpl implements ProjectService {
  async getProjects(): Promise<ProjectProtocol[]> {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...projectStorage].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  async getProject(id: string): Promise<ProjectProtocol | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const project = projectStorage.find(p => p.id === id)
    return project ? { ...project } : null
  }

  async createProject(data: ProjectFormData): Promise<ProjectProtocol> {
    await new Promise(resolve => setTimeout(resolve, 400))

    const newProject: ProjectProtocol = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    projectStorage.push(newProject)
    return { ...newProject }
  }

  async updateProject(id: string, data: Partial<ProjectFormData>): Promise<ProjectProtocol> {
    await new Promise(resolve => setTimeout(resolve, 350))

    const index = projectStorage.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Project not found')
    }

    // 直接使用 data，因为 ProjectFormData 中没有 id 字段

    const updatedProject = {
      ...projectStorage[index],
      ...data,
      updatedAt: new Date().toISOString(),
    } as ProjectProtocol

    projectStorage[index] = updatedProject
    return { ...updatedProject }
  }

  async deleteProject(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = projectStorage.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Project not found')
    }

    projectStorage.splice(index, 1)
  }

  async getProjectStats(): Promise<ProjectStats> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const projects = await this.getProjects()
    const stats = {
      total: projects.length,
      byEnvironment: {
        development: projects.filter(p => p.environment === 'development').length,
        staging: projects.filter(p => p.environment === 'staging').length,
        production: projects.filter(p => p.environment === 'production').length
      }
    }
    return stats
  }
}

// 导出单例实例
export const projectService = new ProjectServiceImpl()
