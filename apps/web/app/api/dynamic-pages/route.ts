import { NextRequest, NextResponse } from 'next/server'
import { dynamicPageService } from '@/lib/dynamic-page-service'
import { PageFormData } from '@/types/dynamic-page'

export async function GET() {
  try {
    const pages = await dynamicPageService.getPages()
    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error fetching dynamic pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PageFormData = await request.json()
    
    // 基本数据验证
    if (!body.title || !body.layout) {
      return NextResponse.json(
        { error: 'Title and layout are required' },
        { status: 400 }
      )
    }
    
    if (body.title.length < 2) {
      return NextResponse.json(
        { error: 'Title must be at least 2 characters' },
        { status: 400 }
      )
    }
    
    const page = await dynamicPageService.savePage(body)
    return NextResponse.json(page, { status: 201 })
  } catch (error: any) {
    console.error('Error creating dynamic page:', error)
    if (error.message === '页面路径已存在') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    )
  }
}