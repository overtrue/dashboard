import { NextRequest, NextResponse } from 'next/server'
import { projectService } from '@/lib/project-service'

export async function GET() {
  try {
    const stats = await projectService.getProjectStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Failed to fetch project stats:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch project statistics'
    }, { status: 500 })
  }
}