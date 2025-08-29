export interface User {
  id: string
  email: string
  password: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
}

export interface UserFormData {
  email: string
  password: string
  role: 'admin' | 'user'
}

export interface UserUpdateData {
  email?: string
  password?: string
  role?: 'admin' | 'user'
}

export interface UserService {
  getUsers(): Promise<User[]>
  getUser(id: string): Promise<User | null>
  createUser(data: UserFormData): Promise<User>
  updateUser(id: string, data: UserUpdateData): Promise<User>
  deleteUser(id: string): Promise<void>
}