import { NextRequest, NextResponse } from 'next/server'
import { dynamicPageService } from '@/lib/dynamic-page-service'
import { PageFormData } from '@/types/dynamic-page'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const page = await dynamicPageService.getPage(id)
    
    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(page)
  } catch (error) {
    console.error('Error fetching dynamic page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch page' },
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
    const body: Partial<PageFormData> = await request.json()
    
    // 数据验证
    if (body.title && body.title.length < 2) {
      return NextResponse.json(
        { error: 'Title must be at least 2 characters' },
        { status: 400 }
      )
    }
    
    const page = await dynamicPageService.updatePage(id, body)
    return NextResponse.json(page)
  } catch (error: any) {
    console.error('Error updating dynamic page:', error)
    if (error.message === '页面不存在') {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }
    if (error.message === '页面路径已存在') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update page' },
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
    await dynamicPageService.deletePage(id)
    return NextResponse.json({ message: 'Page deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting dynamic page:', error)
    if (error.message === '页面不存在') {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }
    if (error.message === '无法删除系统页面') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    )
  }
}