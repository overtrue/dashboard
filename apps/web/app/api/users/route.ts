import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/user-service'
import { UserFormData } from '@/types/user'

export async function GET() {
  try {
    const users = await userService.getUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: UserFormData = await request.json()
    
    // 基本数据验证
    if (!body.email || !body.password || !body.role) {
      return NextResponse.json(
        { error: 'Email, password and role are required' },
        { status: 400 }
      )
    }
    
    if (!body.email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    if (!['admin', 'user'].includes(body.role)) {
      return NextResponse.json(
        { error: 'Role must be admin or user' },
        { status: 400 }
      )
    }
    
    const user = await userService.createUser(body)
    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    if (error.message === 'Email already exists') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}