import { User, UserFormData, UserUpdateData, UserService } from '@/types/user'

// 模拟用户数据存储，包含硬编码的管理员账户
const userStorage: User[] = [
  {
    id: 'admin-1',
    email: 'admin@example.com',
    password: 'admin123', // 在实际应用中应该加密
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

export class UserServiceImpl implements UserService {
  async getUsers(): Promise<User[]> {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...userStorage].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  async getUser(id: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const user = userStorage.find(u => u.id === id)
    return user ? { ...user } : null
  }

  async createUser(data: UserFormData): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // 检查邮箱是否已存在
    const existingUser = userStorage.find(u => u.email === data.email)
    if (existingUser) {
      throw new Error('Email already exists')
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    userStorage.push(newUser)
    return { ...newUser }
  }

  async updateUser(id: string, data: UserUpdateData): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 350))
    
    const index = userStorage.findIndex(u => u.id === id)
    if (index === -1) {
      throw new Error('User not found')
    }
    
    // 如果更新邮箱，检查是否已存在
    if (data.email && data.email !== userStorage[index].email) {
      const existingUser = userStorage.find(u => u.email === data.email)
      if (existingUser) {
        throw new Error('Email already exists')
      }
    }
    
    const updatedUser = {
      ...userStorage[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    userStorage[index] = updatedUser
    return { ...updatedUser }
  }

  async deleteUser(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = userStorage.findIndex(u => u.id === id)
    if (index === -1) {
      throw new Error('User not found')
    }
    
    // 防止删除管理员账户
    if (userStorage[index].role === 'admin' && userStorage[index].id === 'admin-1') {
      throw new Error('Cannot delete default admin user')
    }
    
    userStorage.splice(index, 1)
  }
}

// 导出单例实例
export const userService = new UserServiceImpl()