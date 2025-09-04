import { NextRequest, NextResponse } from 'next/server'
import { dynamicPageService } from '@/lib/dynamic-page-service'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const componentDefinition = await dynamicPageService.renderPage(id)
    
    return NextResponse.json({
      success: true,
      component: componentDefinition
    })
  } catch (error: any) {
    console.error('Error rendering dynamic page:', error)
    if (error.message === '页面不存在') {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to render page' },
      { status: 500 }
    )
  }
}