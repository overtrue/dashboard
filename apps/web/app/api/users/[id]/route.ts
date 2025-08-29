import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/user-service'
import { UserUpdateData } from '@/types/user'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const user = await userService.getUser(id)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body: UserUpdateData = await request.json()
    
    // 数据验证
    if (body.email && !body.email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    if (body.role && !['admin', 'user'].includes(body.role)) {
      return NextResponse.json(
        { error: 'Role must be admin or user' },
        { status: 400 }
      )
    }
    
    const user = await userService.updateUser(id, body)
    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error updating user:', error)
    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }
    if (error.message === 'Email already exists') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    await userService.deleteUser(id)
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }
    if (error.message === 'Cannot delete default admin user') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}